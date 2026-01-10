-- Add name and meta columns to profiles table for charity organizations
-- These columns are needed for the organization search feature in self-reported hours

-- Add name column for charity display names
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add meta column for additional charity metadata (logo, location, etc.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}';

-- Create index on name for faster search
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- Create index on type for filtering by charity/donor
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(type);

-- Create composite index for charity name search
CREATE INDEX IF NOT EXISTS idx_profiles_charity_name ON profiles(type, name) WHERE type = 'charity';

-- Add comment explaining the columns
COMMENT ON COLUMN profiles.name IS 'Display name for the profile (used for charity organization names)';
COMMENT ON COLUMN profiles.meta IS 'JSON metadata including logoUrl, location, description, etc.';
