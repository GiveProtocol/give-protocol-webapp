-- Make phone_number nullable since it's an optional field in the volunteer application form
ALTER TABLE volunteer_applications
ALTER COLUMN phone_number DROP NOT NULL;

COMMENT ON COLUMN volunteer_applications.phone_number IS 'Volunteer phone number (optional)';
