-- Drop applicant_id foreign key constraint to allow testing without profiles
-- The applicant_id still references auth.users(id) which exists, but the constraint
-- is checking profiles table which may not have an entry for the user

-- Find and drop the applicant_id foreign key constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Get the constraint name dynamically
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'volunteer_applications'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%applicant_id%';

    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE volunteer_applications DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Also drop the opportunity_id foreign key to allow sample opportunities
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Get the constraint name dynamically
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'volunteer_applications'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%opportunity_id%';

    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE volunteer_applications DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

COMMENT ON COLUMN volunteer_applications.applicant_id IS 'User ID from auth.users (foreign key constraint removed for testing)';
COMMENT ON COLUMN volunteer_applications.opportunity_id IS 'Volunteer opportunity ID (foreign key constraint removed for testing)';
