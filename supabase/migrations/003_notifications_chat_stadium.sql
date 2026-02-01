-- Zapolya Football Migration 003
-- Adds notifications, chat messages, and inline stadium fields on rooms

-- ============================================
-- 1. NOTIFICATIONS TABLE
-- ============================================

CREATE TYPE notification_type AS ENUM ('join_request', 'request_approved', 'request_rejected', 'match_reminder', 'match_completed');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_room ON notifications(room_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. CHAT MESSAGES TABLE
-- ============================================

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat
CREATE INDEX idx_chat_room ON chat_messages(room_id);
CREATE INDEX idx_chat_created ON chat_messages(room_id, created_at);
CREATE INDEX idx_chat_user ON chat_messages(user_id);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Only room participants can read messages
CREATE POLICY "Participants can view room messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = chat_messages.room_id
      AND room_participants.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = chat_messages.room_id
      AND rooms.creator_id = auth.uid()
    )
  );

-- Only room participants can send messages
CREATE POLICY "Participants can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      EXISTS (
        SELECT 1 FROM room_participants
        WHERE room_participants.room_id = chat_messages.room_id
        AND room_participants.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM rooms
        WHERE rooms.id = chat_messages.room_id
        AND rooms.creator_id = auth.uid()
      )
    )
  );

-- ============================================
-- 3. INLINE STADIUM FIELDS ON ROOMS
-- ============================================

-- Add inline stadium fields to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS stadium_name TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS stadium_address TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS stadium_price_per_hour INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS stadium_latitude DECIMAL(10, 7);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS stadium_longitude DECIMAL(10, 7);

-- Make stadium_id nullable for backwards compatibility
ALTER TABLE rooms ALTER COLUMN stadium_id DROP NOT NULL;

-- Migrate existing room data: copy stadium info to inline fields
UPDATE rooms
SET
  stadium_name = s.name,
  stadium_address = s.address,
  stadium_price_per_hour = s.price_per_hour,
  stadium_latitude = s.latitude,
  stadium_longitude = s.longitude
FROM stadiums s
WHERE rooms.stadium_id = s.id AND rooms.stadium_name IS NULL;

-- ============================================
-- 4. NOTIFICATION TRIGGERS
-- ============================================

-- Function to create notification when join request is created
CREATE OR REPLACE FUNCTION create_join_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  room_creator_id UUID;
  room_title TEXT;
  requester_name TEXT;
BEGIN
  -- Get room creator and title
  SELECT creator_id, title INTO room_creator_id, room_title
  FROM rooms WHERE id = NEW.room_id;

  -- Get requester name
  SELECT full_name INTO requester_name
  FROM profiles WHERE id = NEW.user_id;

  -- Create notification for room creator
  INSERT INTO notifications (user_id, type, title, message, room_id, related_user_id)
  VALUES (
    room_creator_id,
    'join_request',
    'New Join Request',
    requester_name || ' wants to join your match "' || room_title || '"',
    NEW.room_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for join request notifications
DROP TRIGGER IF EXISTS on_join_request_created ON join_requests;
CREATE TRIGGER on_join_request_created
  AFTER INSERT ON join_requests
  FOR EACH ROW EXECUTE FUNCTION create_join_request_notification();

-- Function to create notification when request is approved/rejected
CREATE OR REPLACE FUNCTION create_request_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  room_title TEXT;
  notif_type notification_type;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get room title
  SELECT title INTO room_title
  FROM rooms WHERE id = NEW.room_id;

  -- Set notification based on status
  IF NEW.status = 'approved' THEN
    notif_type := 'request_approved';
    notif_title := 'Request Approved';
    notif_message := 'Your request to join "' || room_title || '" has been approved!';
  ELSIF NEW.status = 'rejected' THEN
    notif_type := 'request_rejected';
    notif_title := 'Request Rejected';
    notif_message := 'Your request to join "' || room_title || '" was not approved.';
  ELSE
    RETURN NEW;
  END IF;

  -- Create notification for the requester
  INSERT INTO notifications (user_id, type, title, message, room_id)
  VALUES (
    NEW.user_id,
    notif_type,
    notif_title,
    notif_message,
    NEW.room_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for request status change notifications
DROP TRIGGER IF EXISTS on_request_status_changed ON join_requests;
CREATE TRIGGER on_request_status_changed
  AFTER UPDATE ON join_requests
  FOR EACH ROW EXECUTE FUNCTION create_request_status_notification();

-- Function to create notification when room is marked as completed
CREATE OR REPLACE FUNCTION create_room_completed_notification()
RETURNS TRIGGER AS $$
DECLARE
  participant RECORD;
BEGIN
  -- Only trigger when status changes to completed
  IF OLD.status = NEW.status OR NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;

  -- Notify all participants
  FOR participant IN
    SELECT user_id FROM room_participants WHERE room_id = NEW.id
  LOOP
    INSERT INTO notifications (user_id, type, title, message, room_id)
    VALUES (
      participant.user_id,
      'match_completed',
      'Match Completed',
      'The match "' || NEW.title || '" has been completed. Rate your teammates!',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for room completion notifications
DROP TRIGGER IF EXISTS on_room_completed ON rooms;
CREATE TRIGGER on_room_completed
  AFTER UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION create_room_completed_notification();

-- ============================================
-- 5. REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for chat messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
