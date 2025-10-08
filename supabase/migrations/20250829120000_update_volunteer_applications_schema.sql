-- Update volunteer_applications table schema
-- Add new fields: location, timezone, age_range
-- Remove fields: date_of_birth, reference_contacts, work_samples

-- Add new columns
ALTER TABLE volunteer_applications 
ADD COLUMN location text,
ADD COLUMN timezone text,
ADD COLUMN age_range text CHECK (age_range IN ('under-18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'));

-- Add consent tracking
ALTER TABLE volunteer_applications 
ADD COLUMN consent_given boolean DEFAULT false,
ADD COLUMN international_transfers_consent boolean DEFAULT false;

-- Drop old columns that are no longer needed
ALTER TABLE volunteer_applications 
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS reference_contacts,
DROP COLUMN IF EXISTS work_samples;

-- Update existing records to have consent_given = true for existing applications
UPDATE volunteer_applications 
SET consent_given = true 
WHERE consent_given IS NULL OR consent_given = false;

-- Add comment for documentation
COMMENT ON COLUMN volunteer_applications.location IS 'Volunteer location/city (optional)';
COMMENT ON COLUMN volunteer_applications.timezone IS 'Volunteer timezone preference (optional)';
COMMENT ON COLUMN volunteer_applications.age_range IS 'Volunteer age range selection (required)';
COMMENT ON COLUMN volunteer_applications.consent_given IS 'Essential processing consent given (required)';
COMMENT ON COLUMN volunteer_applications.international_transfers_consent IS 'International data transfer consent (optional)';