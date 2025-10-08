-- Consolidate volunteer_opportunities RLS policies to fix Supabase performance warning
-- Issue: Multiple permissive policies for authenticated role on SELECT action
-- Solution: Combine policies into single comprehensive policy

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Anyone can read active opportunities" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "Charities can manage own opportunities" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "Consolidated volunteer opportunities access" ON public.volunteer_opportunities;

-- Create single consolidated policy for SELECT operations
CREATE POLICY "Read active opportunities and own opportunities" 
ON public.volunteer_opportunities 
FOR SELECT 
TO authenticated 
USING (
    -- Condition 1: Anyone can read active opportunities
    status = 'active' OR 
    
    -- Condition 2: Charities can read their own opportunities
    charity_id = (SELECT id FROM public.charities WHERE user_id = auth.uid())
);

-- Add performance-optimized index
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_status_charity_performance 
ON public.volunteer_opportunities (status, charity_id);

-- Add comment explaining the consolidation
COMMENT ON POLICY "Read active opportunities and own opportunities" ON public.volunteer_opportunities IS 
'Consolidated policy combining public access to active opportunities and charity access to own opportunities. Fixes Supabase multiple permissive policies performance warning.';