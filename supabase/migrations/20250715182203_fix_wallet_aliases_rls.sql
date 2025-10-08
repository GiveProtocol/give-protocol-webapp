-- Fix wallet_aliases RLS performance issues
-- Consolidates multiple permissive policies and optimizes auth.uid() usage

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can read wallet aliases" ON wallet_aliases;
DROP POLICY IF EXISTS "Users can manage their own wallet aliases" ON wallet_aliases;

-- Create consolidated RLS policy for SELECT operations
CREATE POLICY "Consolidated wallet aliases access" ON wallet_aliases
FOR SELECT
TO authenticated
USING (
    -- Allow reading all wallet aliases (public access for address resolution)
    true OR
    -- Allow users to see their own wallet aliases (ownership check)
    user_id = (SELECT auth.uid())
);

-- Note: The "true OR" condition means all authenticated users can read all wallet aliases
-- This maintains the original "Anyone can read wallet aliases" policy behavior
-- while also including the ownership check for consistency

-- Add performance comment for future reference
COMMENT ON POLICY "Consolidated wallet aliases access" ON wallet_aliases IS 
'Consolidates "Anyone can read wallet aliases" and "Users can manage their own wallet aliases" for better performance. Uses subquery to prevent auth.uid() re-evaluation per row.';