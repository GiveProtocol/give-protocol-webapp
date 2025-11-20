-- Comprehensive cleanup: Drop ALL policies on volunteer_applications table
-- This includes policies from all previous migrations

-- Disable RLS temporarily to ensure clean slate
ALTER TABLE volunteer_applications DISABLE ROW LEVEL SECURITY;

-- Drop every single policy that might exist (from all migration files)
DROP POLICY IF EXISTS "Volunteers can insert own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Volunteers can read own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can read applications for their opportunities" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update application status" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can read own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can read applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update applications" ON volunteer_applications;
DROP POLICY IF EXISTS "volunteer_applications_insert" ON volunteer_applications;
DROP POLICY IF EXISTS "volunteer_applications_select_own" ON volunteer_applications;
DROP POLICY IF EXISTS "volunteer_applications_select_all" ON volunteer_applications;
DROP POLICY IF EXISTS "volunteer_applications_update" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can view applications for their opportunities" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can create applications" ON volunteer_applications;
DROP POLICY IF EXISTS "volunteer_applications_authenticated_select" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update applications for their opportunities" ON volunteer_applications;

-- Re-enable RLS
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Create ONE simple policy for INSERT that allows all authenticated users
CREATE POLICY "allow_authenticated_insert" ON volunteer_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create ONE simple policy for SELECT that allows all authenticated users
CREATE POLICY "allow_authenticated_select" ON volunteer_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Create ONE simple policy for UPDATE that allows all authenticated users
CREATE POLICY "allow_authenticated_update" ON volunteer_applications
  FOR UPDATE
  TO authenticated
  USING (true);

COMMENT ON TABLE volunteer_applications IS 'Volunteer application submissions - RLS allows all authenticated users, filtering happens in application layer';
