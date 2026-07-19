-- ============================================================
-- FIFA World Cup 2026 Prediction Website - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ USERS TABLE ============
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  ip_address VARCHAR(45)
);

-- ============ MATCHES TABLE ============
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_home VARCHAR(50) NOT NULL DEFAULT 'Argentina',
  team_away VARCHAR(50) NOT NULL DEFAULT 'Spain',
  kickoff_time TIMESTAMPTZ NOT NULL DEFAULT '2026-07-19T20:00:00Z',
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'halftime', 'extra_time', 'penalties', 'finished')),
  score_home INTEGER DEFAULT 0,
  score_away INTEGER DEFAULT 0,
  goal_events JSONB DEFAULT '[]'::jsonb,
  cards JSONB DEFAULT '[]'::jsonb,
  possession_home INTEGER DEFAULT 50,
  possession_away INTEGER DEFAULT 50,
  corners_home INTEGER DEFAULT 0,
  corners_away INTEGER DEFAULT 0,
  man_of_match VARCHAR(100),
  winner VARCHAR(50),
  final_result VARCHAR(20),
  predictions_locked BOOLEAN DEFAULT false,
  match_minute INTEGER DEFAULT 0,
  shots_home INTEGER DEFAULT 0,
  shots_away INTEGER DEFAULT 0,
  auto_sync BOOLEAN DEFAULT false,
  fotmob_match_id VARCHAR(50) DEFAULT '4653858',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ PREDICTIONS TABLE ============
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  winner VARCHAR(50) NOT NULL,
  score_home INTEGER NOT NULL,
  score_away INTEGER NOT NULL,
  first_team_to_score VARCHAR(50) NOT NULL,
  first_goal_scorer VARCHAR(100) NOT NULL,
  man_of_match VARCHAR(100) NOT NULL,
  total_goals VARCHAR(10) NOT NULL,
  match_ends_in VARCHAR(20) NOT NULL CHECK (match_ends_in IN ('90 Minutes', 'Extra Time', 'Penalties')),
  both_teams_score VARCHAR(3) NOT NULL CHECK (both_teams_score IN ('Yes', 'No')),
  yellow_cards INTEGER NOT NULL,
  red_card VARCHAR(3) NOT NULL CHECK (red_card IN ('Yes', 'No')),
  possession VARCHAR(50) NOT NULL,
  corners INTEGER NOT NULL,
  last_goal_scorer VARCHAR(100) NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- ============ LEADERBOARD TABLE ============
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  UNIQUE(user_id, match_id)
);

-- ============ ADMIN LOGS TABLE ============
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_predictions_user_match ON predictions(user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_match_rank ON leaderboard(match_id, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_match_points ON leaderboard(match_id, points DESC);

-- ============ INSERT DEFAULT ADMIN ============
-- Password: WCW2026 (hashed with bcrypt)
-- You'll need to register the admin through the app or insert manually after hashing
-- The app will auto-create the admin on first run

-- ============ INSERT DEFAULT MATCH ============
INSERT INTO matches (team_home, team_away, kickoff_time, status, predictions_locked)
VALUES ('Argentina', 'Spain', '2026-07-19T20:00:00Z', 'upcoming', false)
ON CONFLICT DO NOTHING;

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations through service role (API routes)
CREATE POLICY "Allow all for service" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for service" ON predictions FOR ALL USING (true);
CREATE POLICY "Allow all for service" ON leaderboard FOR ALL USING (true);
CREATE POLICY "Allow all for service" ON matches FOR ALL USING (true);
CREATE POLICY "Allow all for service" ON admin_logs FOR ALL USING (true);
