-- Fix Supabase performance issues for volunteer_opportunities table
-- Issues to resolve:
-- 1. Duplicate Index: idx_volunteer_opportunities_charity_id & volunteer_opportunities_charity_id_idx
-- 2. Multiple Permissive Policies for SELECT action
-- 3. Auth RLS Initialization Plan optimization

BEGIN;

-- =============================================================================
-- 1. Fix Duplicate Index Issue
-- =============================================================================
-- Drop the duplicate index, keeping the more descriptive one
DROP INDEX IF EXISTS public.volunteer_opportunities_charity_id_idx;
-- Keep: idx_volunteer_opportunities_charity_id (more descriptive naming)

-- Verify the remaining index exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'volunteer_opportunities' 
        AND indexname = 'idx_volunteer_opportunities_charity_id'
    ) THEN
        CREATE INDEX idx_volunteer_opportunities_charity_id 
        ON public.volunteer_opportunities(charity_id);
    END IF;
END $$;

-- =============================================================================
-- 2. Fix Multiple Permissive Policies
-- =============================================================================
-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Anyone can read active opportunities" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "Anyone can view active opportunities" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "Charities can manage own opportunities" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "Read active opportunities and own opportunities" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "Consolidated volunteer opportunities access" ON public.volunteer_opportunities;

-- =============================================================================
-- 3. Create Optimized RLS Policies
-- =============================================================================
-- Optimize auth function calls by using subqueries instead of direct calls
-- This prevents re-evaluation for each row

-- Policy for SELECT operations (combines public and private access)
CREATE POLICY "volunteer_opportunities_select_policy" 
ON public.volunteer_opportunities 
FOR SELECT 
TO authenticated 
USING (
    -- Anyone can read active opportunities
    status = 'active' OR 
    
    -- Charities can read their own opportunities (optimized with subquery)
    charity_id IN (
        SELECT p.id 
        FROM public.profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.type = 'charity'
    )
);

-- Separate policies for write operations (charity-only)
CREATE POLICY "volunteer_opportunities_insert_policy" 
ON public.volunteer_opportunities 
FOR INSERT 
TO authenticated 
WITH CHECK (
    charity_id IN (
        SELECT p.id 
        FROM public.profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.type = 'charity'
    )
);

CREATE POLICY "volunteer_opportunities_update_policy" 
ON public.volunteer_opportunities 
FOR UPDATE 
TO authenticated 
USING (
    charity_id IN (
        SELECT p.id 
        FROM public.profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.type = 'charity'
    )
)
WITH CHECK (
    charity_id IN (
        SELECT p.id 
        FROM public.profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.type = 'charity'
    )
);

CREATE POLICY "volunteer_opportunities_delete_policy" 
ON public.volunteer_opportunities 
FOR DELETE 
TO authenticated 
USING (
    charity_id IN (
        SELECT p.id 
        FROM public.profiles p 
        WHERE p.user_id = (SELECT auth.uid()) 
        AND p.type = 'charity'
    )
);

-- =============================================================================
-- 4. Performance Optimization Indexes
-- =============================================================================
-- Composite index for the most common query patterns
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_status_charity_perf 
ON public.volunteer_opportunities (status, charity_id)
WHERE status = 'active';

-- Index for charity-specific queries
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_charity_status 
ON public.volunteer_opportunities (charity_id, status);

-- =============================================================================
-- 5. Add Policy Comments for Documentation
-- =============================================================================
COMMENT ON POLICY "volunteer_opportunities_select_policy" ON public.volunteer_opportunities IS 
'Optimized SELECT policy: Public access to active opportunities, charity access to own opportunities. Uses subqueries to prevent auth function re-evaluation per row.';

COMMENT ON POLICY "volunteer_opportunities_insert_policy" ON public.volunteer_opportunities IS 
'INSERT policy: Only charities can create opportunities for themselves. Optimized with auth subquery.';

COMMENT ON POLICY "volunteer_opportunities_update_policy" ON public.volunteer_opportunities IS 
'UPDATE policy: Only charities can update their own opportunities. Optimized with auth subquery.';

COMMENT ON POLICY "volunteer_opportunities_delete_policy" ON public.volunteer_opportunities IS 
'DELETE policy: Only charities can delete their own opportunities. Optimized with auth subquery.';

-- =============================================================================
-- 6. Verify Changes
-- =============================================================================
-- Log the changes for verification
DO $$ 
DECLARE 
    policy_count INTEGER;
    index_count INTEGER;
BEGIN 
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'volunteer_opportunities';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'volunteer_opportunities';
    
    RAISE NOTICE 'Migration completed: % policies, % indexes on volunteer_opportunities', policy_count, index_count;
END $$;

COMMIT;