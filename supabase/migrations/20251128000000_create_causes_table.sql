-- Migration: Create causes table for charity projects/campaigns
-- Each charity can have a maximum of 3 active causes at any time.

CREATE TABLE IF NOT EXISTS causes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  charity_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
  raised_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (raised_amount >= 0),
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  image_path TEXT,
  impact TEXT[] DEFAULT '{}',
  timeline VARCHAR(255),
  location VARCHAR(255),
  partners TEXT[] DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment explaining the table
COMMENT ON TABLE causes IS 'Charity causes/projects that can receive donations. Limited to 3 active per charity.';
COMMENT ON COLUMN causes.target_amount IS 'Funding goal for the cause';
COMMENT ON COLUMN causes.raised_amount IS 'Amount raised so far (updated via donations)';
COMMENT ON COLUMN causes.impact IS 'Array of impact statement strings';
COMMENT ON COLUMN causes.partners IS 'Array of partner organization names';

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_causes_charity_id ON causes(charity_id);
CREATE INDEX IF NOT EXISTS idx_causes_status ON causes(status);
CREATE INDEX IF NOT EXISTS idx_causes_category ON causes(category);

-- Enable Row Level Security
ALTER TABLE causes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view active causes
DROP POLICY IF EXISTS "Anyone can view active causes" ON causes;
CREATE POLICY "Anyone can view active causes"
ON causes
FOR SELECT
TO public
USING (status = 'active');

-- Charities can view all their own causes (including inactive)
DROP POLICY IF EXISTS "Charities can view own causes" ON causes;
CREATE POLICY "Charities can view own causes"
ON causes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = causes.charity_id
    AND profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
  )
);

-- Charities can insert causes for their charity
DROP POLICY IF EXISTS "Charities can create causes" ON causes;
CREATE POLICY "Charities can create causes"
ON causes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = causes.charity_id
    AND profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
  )
);

-- Charities can update their own causes
DROP POLICY IF EXISTS "Charities can update own causes" ON causes;
CREATE POLICY "Charities can update own causes"
ON causes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = causes.charity_id
    AND profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = causes.charity_id
    AND profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
  )
);

-- Charities can delete their own causes
DROP POLICY IF EXISTS "Charities can delete own causes" ON causes;
CREATE POLICY "Charities can delete own causes"
ON causes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = causes.charity_id
    AND profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
  )
);

-- Function to update raised_amount when donations are made
-- This would be called by a trigger on the donations table
CREATE OR REPLACE FUNCTION update_cause_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cause_id IS NOT NULL THEN
    UPDATE causes
    SET raised_amount = raised_amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.cause_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger on donations table should be created separately
-- once the donations table has a cause_id column added
