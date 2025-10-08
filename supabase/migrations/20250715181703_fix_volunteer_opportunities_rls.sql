-- Fix volunteer_opportunities RLS performance issues
-- Consolidates multiple permissive policies and optimizes auth.uid() usage

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can read active opportunities" ON volunteer_opportunities;
DROP POLICY IF EXISTS "Charities can manage own opportunities" ON volunteer_opportunities;

-- Create consolidated RLS policy for SELECT operations
CREATE POLICY "Consolidated volunteer opportunities access" ON volunteer_opportunities
FOR SELECT
TO authenticated
USING (
    -- Allow reading active opportunities (public access)
    status = 'active' OR 
    -- Allow charities to see their own opportunities (ownership check)
    charity_id IN (
        SELECT id FROM profiles 
        WHERE user_id = (SELECT auth.uid()) AND type = 'charity'
    )
);

-- Keep existing policies for other operations (INSERT, UPDATE, DELETE)
-- Only consolidate the SELECT policies that were causing performance issues

-- Remove duplicate index (keep the first one)
DROP INDEX IF EXISTS volunteer_opportunities_charity_id_idx;

-- Add optimized index if not already present
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_status_charity 
ON volunteer_opportunities (status, charity_id);

-- Add performance comment for future reference
COMMENT ON POLICY "Consolidated volunteer opportunities access" ON volunteer_opportunities IS 
'Consolidates "Anyone can read active opportunities" and "Charities can manage own opportunities" for better performance. Uses subquery to prevent auth.uid() re-evaluation per row.';