-- Player Stats and Ratings Migration
-- Adds FIFA-style player stats and rating system

-- Player stats table (aggregated from ratings)
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  pace INTEGER DEFAULT 50 CHECK (pace >= 0 AND pace <= 99),
  shooting INTEGER DEFAULT 50 CHECK (shooting >= 0 AND shooting <= 99),
  passing INTEGER DEFAULT 50 CHECK (passing >= 0 AND passing <= 99),
  dribbling INTEGER DEFAULT 50 CHECK (dribbling >= 0 AND dribbling <= 99),
  defense INTEGER DEFAULT 50 CHECK (defense >= 0 AND defense <= 99),
  physical INTEGER DEFAULT 50 CHECK (physical >= 0 AND physical <= 99),
  overall INTEGER GENERATED ALWAYS AS ((pace + shooting + passing + dribbling + defense + physical) / 6) STORED,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual ratings given after games
CREATE TABLE player_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pace INTEGER CHECK (pace >= 0 AND pace <= 99),
  shooting INTEGER CHECK (shooting >= 0 AND shooting <= 99),
  passing INTEGER CHECK (passing >= 0 AND passing <= 99),
  dribbling INTEGER CHECK (dribbling >= 0 AND dribbling <= 99),
  defense INTEGER CHECK (defense >= 0 AND defense <= 99),
  physical INTEGER CHECK (physical >= 0 AND physical <= 99),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, rater_id, rated_id)
);

-- Indexes for performance
CREATE INDEX idx_player_stats_user ON player_stats(user_id);
CREATE INDEX idx_player_stats_overall ON player_stats(overall DESC);
CREATE INDEX idx_player_ratings_room ON player_ratings(room_id);
CREATE INDEX idx_player_ratings_rated ON player_ratings(rated_id);
CREATE INDEX idx_player_ratings_rater ON player_ratings(rater_id);

-- Enable RLS
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_ratings ENABLE ROW LEVEL SECURITY;

-- Player stats policies (public read, system write)
CREATE POLICY "Player stats are viewable by everyone" ON player_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own stats" ON player_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update player stats" ON player_stats
  FOR UPDATE USING (true);

-- Player ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON player_ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate others" ON player_ratings
  FOR INSERT WITH CHECK (
    auth.uid() = rater_id AND
    auth.uid() != rated_id AND
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_id = player_ratings.room_id AND user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_id = player_ratings.room_id AND user_id = player_ratings.rated_id
    ) AND
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = player_ratings.room_id AND status = 'completed'
    )
  );

-- Function to create initial player stats for new users
CREATE OR REPLACE FUNCTION create_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO player_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create player stats when profile is created
CREATE TRIGGER on_profile_created_create_stats
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_player_stats();

-- Function to update player stats when a new rating is submitted
CREATE OR REPLACE FUNCTION update_player_stats_on_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_pace INTEGER;
  avg_shooting INTEGER;
  avg_passing INTEGER;
  avg_dribbling INTEGER;
  avg_defense INTEGER;
  avg_physical INTEGER;
  rating_count INTEGER;
BEGIN
  -- Calculate averages from all ratings for this player
  SELECT
    ROUND(AVG(pace))::INTEGER,
    ROUND(AVG(shooting))::INTEGER,
    ROUND(AVG(passing))::INTEGER,
    ROUND(AVG(dribbling))::INTEGER,
    ROUND(AVG(defense))::INTEGER,
    ROUND(AVG(physical))::INTEGER,
    COUNT(*)::INTEGER
  INTO avg_pace, avg_shooting, avg_passing, avg_dribbling, avg_defense, avg_physical, rating_count
  FROM player_ratings
  WHERE rated_id = NEW.rated_id;

  -- Update or insert player stats
  INSERT INTO player_stats (user_id, pace, shooting, passing, dribbling, defense, physical, total_ratings, updated_at)
  VALUES (NEW.rated_id, avg_pace, avg_shooting, avg_passing, avg_dribbling, avg_defense, avg_physical, rating_count, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    pace = EXCLUDED.pace,
    shooting = EXCLUDED.shooting,
    passing = EXCLUDED.passing,
    dribbling = EXCLUDED.dribbling,
    defense = EXCLUDED.defense,
    physical = EXCLUDED.physical,
    total_ratings = EXCLUDED.total_ratings,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when rating is added
CREATE TRIGGER on_rating_added
  AFTER INSERT ON player_ratings
  FOR EACH ROW EXECUTE FUNCTION update_player_stats_on_rating();

-- Create initial player_stats for existing profiles
INSERT INTO player_stats (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
