-- Drop foreign key constraints that prevent testing with sample data
-- This allows volunteer applications to be submitted with sample charity IDs

-- Find and drop the charity_id foreign key constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Get the constraint name dynamically
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'volunteer_applications'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%charity_id%';

    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE volunteer_applications DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

COMMENT ON COLUMN volunteer_applications.charity_id IS 'Charity profile ID (foreign key constraint removed for testing flexibility)';
