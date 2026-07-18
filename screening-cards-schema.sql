-- ============================================================
-- FCB Screening Cards - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============ SCREENING CARDS TABLE ============
-- Stores which card design is assigned to each user
-- and whether the physical card has been collected
CREATE TABLE IF NOT EXISTS screening_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_design VARCHAR(50) NOT NULL CHECK (card_design IN ('messi_white', 'messi_barca', 'messi_goat')),
  card_number VARCHAR(20) UNIQUE NOT NULL,
  is_collected BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  collected_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES users(id),
  collected_marked_by UUID REFERENCES users(id),
  UNIQUE(user_id)
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_screening_cards_user ON screening_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_screening_cards_number ON screening_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_screening_cards_collected ON screening_cards(is_collected);

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE screening_cards ENABLE ROW LEVEL SECURITY;

-- Allow all operations through service role (API routes)
CREATE POLICY "Allow all for service" ON screening_cards FOR ALL USING (true);
