-- Azfar Football Database Schema
-- Run this in your Supabase SQL Editor
-- This will DROP existing tables and recreate everything fresh

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_participant_change ON room_participants;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_room_player_count();

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS join_requests CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS stadiums CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS position_type CASCADE;
DROP TYPE IF EXISTS skill_level_type CASCADE;
DROP TYPE IF EXISTS room_status_type CASCADE;
DROP TYPE IF EXISTS request_status_type CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE position_type AS ENUM ('goalkeeper', 'defender', 'midfielder', 'forward', 'any');
CREATE TYPE skill_level_type AS ENUM ('beginner', 'intermediate', 'advanced', 'professional', 'any');
CREATE TYPE room_status_type AS ENUM ('open', 'full', 'cancelled', 'completed');
CREATE TYPE request_status_type AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  age INTEGER CHECK (age IS NULL OR (age >= 16 AND age <= 100)),
  preferred_position position_type DEFAULT 'any',
  skill_level skill_level_type DEFAULT 'intermediate',
  bio TEXT,
  avatar_url TEXT,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stadiums table
CREATE TABLE stadiums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price_per_hour INTEGER NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  stadium_id UUID REFERENCES stadiums(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_players INTEGER NOT NULL CHECK (max_players >= 2),
  current_players INTEGER DEFAULT 1,
  skill_level_required skill_level_type DEFAULT 'any',
  status room_status_type DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Join requests table
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status request_status_type DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Room participants table
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_rooms_stadium ON rooms(stadium_id);
CREATE INDEX idx_rooms_creator ON rooms(creator_id);
CREATE INDEX idx_rooms_date ON rooms(date);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_join_requests_room ON join_requests(room_id);
CREATE INDEX idx_join_requests_user ON join_requests(user_id);
CREATE INDEX idx_join_requests_status ON join_requests(status);
CREATE INDEX idx_participants_room ON room_participants(room_id);
CREATE INDEX idx_participants_user ON room_participants(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Stadiums policies (public read-only)
CREATE POLICY "Stadiums are viewable by everyone" ON stadiums
  FOR SELECT USING (true);

-- Rooms policies
CREATE POLICY "Rooms are viewable by everyone" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Room creators can update their rooms" ON rooms
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Room creators can delete their rooms" ON rooms
  FOR DELETE USING (auth.uid() = creator_id);

-- Join requests policies
CREATE POLICY "Users can view their own requests" ON join_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT creator_id FROM rooms WHERE id = room_id)
  );

CREATE POLICY "Authenticated users can create requests" ON join_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Room creators can update request status" ON join_requests
  FOR UPDATE USING (
    auth.uid() IN (SELECT creator_id FROM rooms WHERE id = room_id)
  );

-- Room participants policies
CREATE POLICY "Participants are viewable by everyone" ON room_participants
  FOR SELECT USING (true);

CREATE POLICY "System can insert participants" ON room_participants
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT creator_id FROM rooms WHERE id = room_id) OR
    auth.uid() = user_id
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, age, preferred_position, skill_level, bio)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NULLIF(NEW.raw_user_meta_data->>'age', '')::integer,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'preferred_position', '')::position_type, 'any'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'skill_level', '')::skill_level_type, 'intermediate'),
    NEW.raw_user_meta_data->>'bio'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update room player count
CREATE OR REPLACE FUNCTION update_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rooms SET current_players = current_players + 1 WHERE id = NEW.room_id;
    -- Auto-set to full if max reached
    UPDATE rooms SET status = 'full'
    WHERE id = NEW.room_id AND current_players >= max_players;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rooms SET current_players = current_players - 1 WHERE id = OLD.room_id;
    -- Reopen if was full
    UPDATE rooms SET status = 'open'
    WHERE id = OLD.room_id AND status = 'full' AND current_players < max_players;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update player count
CREATE TRIGGER on_participant_change
  AFTER INSERT OR DELETE ON room_participants
  FOR EACH ROW EXECUTE FUNCTION update_room_player_count();

-- Insert sample stadiums
INSERT INTO stadiums (id, name, address, district, capacity, price_per_hour, amenities, image_url, latitude, longitude) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Azfar Arena Narimanov', 'Narimanov district, Tabriz str. 45', 'Narimanov', 14, 80, ARRAY['Parking', 'Changing Rooms', 'Showers', 'Cafeteria', 'Night Lighting'], '/stadium-1.jpg', 40.4093, 49.8671),
  ('22222222-2222-2222-2222-222222222222', 'Azfar Arena Yasamal', 'Yasamal district, Sharifzade str. 112', 'Yasamal', 12, 70, ARRAY['Parking', 'Changing Rooms', 'Showers', 'Night Lighting'], '/stadium-2.jpg', 40.3897, 49.8234),
  ('33333333-3333-3333-3333-333333333333', 'Azfar Arena Nizami', 'Nizami district, 28 May str. 78', 'Nizami', 16, 90, ARRAY['Parking', 'Changing Rooms', 'Showers', 'Cafeteria', 'Night Lighting', 'VIP Lounge'], '/stadium-3.jpg', 40.3777, 49.8520),
  ('44444444-4444-4444-4444-444444444444', 'Azfar Arena Khirdalan', 'Khirdalan city, Heyder Aliyev ave. 200', 'Khirdalan', 14, 60, ARRAY['Parking', 'Changing Rooms', 'Night Lighting'], '/stadium-4.jpg', 40.4456, 49.7554),
  ('55555555-5555-5555-5555-555555555555', 'Azfar Arena Binagadi', 'Binagadi district, Binagadi highway 25', 'Binagadi', 14, 75, ARRAY['Parking', 'Changing Rooms', 'Showers', 'Cafeteria', 'Night Lighting'], '/stadium-5.jpg', 40.4532, 49.8234);
