-- Fix infinite recursion in volunteer_applications RLS policies
-- Drop all existing policies (both old and new names)
DROP POLICY IF EXISTS "Volunteers can insert own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Volunteers can read own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can read applications for their opportunities" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update application status" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can read own applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can read applications" ON volunteer_applications;
DROP POLICY IF EXISTS "Charities can update applications" ON volunteer_applications;

-- Create simplified RLS policies that don't cause recursion
-- Policy 1: Allow authenticated users to insert their own applications
CREATE POLICY "Users can insert own applications" ON volunteer_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

-- Policy 2: Allow users to read their own applications
CREATE POLICY "Users can read own applications" ON volunteer_applications
  FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

-- Policy 3: Allow users to read applications where they are the charity
-- Simplified to avoid recursion - just check charity_id directly without joining profiles
CREATE POLICY "Charities can read applications" ON volunteer_applications
  FOR SELECT
  TO authenticated
  USING (
    charity_id::uuid IN (
      SELECT id FROM profiles WHERE user_id = auth.uid() AND type = 'charity'
    )
  );

-- Policy 4: Allow charities to update application status
CREATE POLICY "Charities can update applications" ON volunteer_applications
  FOR UPDATE
  TO authenticated
  USING (
    charity_id::uuid IN (
      SELECT id FROM profiles WHERE user_id = auth.uid() AND type = 'charity'
    )
  );

-- Add helpful comments
COMMENT ON POLICY "Users can insert own applications" ON volunteer_applications IS 'Allows authenticated users to submit volunteer applications';
COMMENT ON POLICY "Users can read own applications" ON volunteer_applications IS 'Allows users to view their own applications';
COMMENT ON POLICY "Charities can read applications" ON volunteer_applications IS 'Allows charities to view applications for their opportunities';
COMMENT ON POLICY "Charities can update applications" ON volunteer_applications IS 'Allows charities to update application status';
