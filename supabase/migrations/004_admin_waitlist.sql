-- Tapadam Football Migration 004
-- Adds admin support, waitlist table, and missing_cancelled notification type

-- ============================================
-- 1. ADMIN FIELD ON PROFILES
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- Update room DELETE policy to allow admins
DROP POLICY IF EXISTS "Room creators can delete their rooms" ON rooms;

CREATE POLICY "Room creators or admins can delete rooms" ON rooms
  FOR DELETE USING (
    auth.uid() = creator_id
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================
-- 2. WAITLIST TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_room ON waitlist(room_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Waitlist entries are viewable by room creator and participant" ON waitlist
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM rooms WHERE id = waitlist.room_id AND creator_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Authenticated users can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waitlist" ON waitlist
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM rooms WHERE id = waitlist.room_id AND creator_id = auth.uid())
  );

-- ============================================
-- 3. ADD match_cancelled NOTIFICATION TYPE
-- ============================================

-- Extend the notification_type enum
DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'match_cancelled';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 4. ENABLE REALTIME FOR ROOMS TABLE
-- ============================================

-- Add rooms to realtime so match list updates live
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE join_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE waitlist;
