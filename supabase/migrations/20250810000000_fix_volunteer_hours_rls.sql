-- Fix volunteer_hours RLS policies to allow proper access
-- This fixes the 500 errors on charity portal volunteer hours queries

-- First, drop all existing volunteer_hours policies
DROP POLICY IF EXISTS "Users can create own volunteer hours" ON volunteer_hours;
DROP POLICY IF EXISTS "Charities can approve volunteer hours" ON volunteer_hours;
DROP POLICY IF EXISTS "Users can read own volunteer hours" ON volunteer_hours;

-- Create properly structured policies with explicit operations

-- Policy 1: Allow volunteers to insert their own volunteer hours
CREATE POLICY "Users can create own volunteer hours" ON volunteer_hours
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = volunteer_id);

-- Policy 2: Allow volunteers to read their own volunteer hours
CREATE POLICY "Users can read own volunteer hours" ON volunteer_hours
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = volunteer_id);

-- Policy 3: Allow charities to read volunteer hours for their charity (THIS WAS MISSING!)
CREATE POLICY "Charities can read volunteer hours for their charity" ON volunteer_hours
  FOR SELECT
  TO authenticated
  USING (charity_id IN (
    SELECT id FROM profiles WHERE user_id = (SELECT auth.uid()) AND type = 'charity'
  ));

-- Policy 4: Allow charities to update volunteer hours (for approval/status changes)
CREATE POLICY "Charities can update volunteer hours for their charity" ON volunteer_hours
  FOR UPDATE
  TO authenticated
  USING (charity_id IN (
    SELECT id FROM profiles WHERE user_id = (SELECT auth.uid()) AND type = 'charity'
  ));

-- Add indexes to improve performance of these queries
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_charity_id_status 
ON volunteer_hours (charity_id, status);

CREATE INDEX IF NOT EXISTS idx_volunteer_hours_volunteer_id 
ON volunteer_hours (volunteer_id);

-- Add helpful comments
COMMENT ON POLICY "Charities can read volunteer hours for their charity" ON volunteer_hours IS 
'Allows charity portal to query volunteer hours for statistics and pending approvals. Fixes 500 errors.';