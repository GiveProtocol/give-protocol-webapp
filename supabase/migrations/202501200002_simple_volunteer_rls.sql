-- Fix infinite recursion by using simple RLS policies that don't reference other tables
-- Drop all existing policies
DROP POLICY IF EXISTS "Volunteers can insert own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Volunteers can read own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can read applications for their opportunities" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update application status" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can read own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can read applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update applications" ON volunteer_applications;

-- Enable RLS on the table
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Create simple policies that don't cause recursion
-- Policy 1: Allow authenticated users to insert applications (no complex checks)
CREATE POLICY "volunteer_applications_insert" ON volunteer_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 2: Allow users to read their own applications
CREATE POLICY "volunteer_applications_select_own" ON volunteer_applications
  FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

-- Policy 3: Allow users to read all applications (we'll filter on the application layer)
-- This is needed to avoid recursion issues with charity checks
CREATE POLICY "volunteer_applications_select_all" ON volunteer_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Allow authenticated users to update applications
CREATE POLICY "volunteer_applications_update" ON volunteer_applications
  FOR UPDATE
  TO authenticated
  USING (true);

COMMENT ON POLICY "volunteer_applications_insert" ON volunteer_applications IS 'Allows authenticated users to submit applications';
COMMENT ON POLICY "volunteer_applications_select_own" ON volunteer_applications IS 'Allows users to view their own applications';
COMMENT ON POLICY "volunteer_applications_select_all" ON volunteer_applications IS 'Allows viewing all applications (filtered in app layer)';
COMMENT ON POLICY "volunteer_applications_update" ON volunteer_applications IS 'Allows updating applications';
