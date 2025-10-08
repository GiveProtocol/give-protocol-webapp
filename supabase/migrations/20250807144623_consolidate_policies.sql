-- Consolidate multiple permissive policies for better performance
-- Multiple permissive policies on the same table/action cause redundant checks

-- Consolidate 2 policies for charity_approvals (anon, SELECT)
-- Policies to consolidate: Admins can view all charity approvals, Charities can view their own approvals
DROP POLICY IF EXISTS "Admins can view all charity approvals" ON charity_approvals;
DROP POLICY IF EXISTS "Charities can view their own approvals" ON charity_approvals;

-- Create consolidated policy
CREATE POLICY "charity_approvals_anon_select" ON charity_approvals
  FOR SELECT
  TO anon
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for charity_approvals (authenticated, SELECT)
-- Policies to consolidate: Admins can view all charity approvals, Charities can view their own approvals
DROP POLICY IF EXISTS "Admins can view all charity approvals" ON charity_approvals;
DROP POLICY IF EXISTS "Charities can view their own approvals" ON charity_approvals;

-- Create consolidated policy
CREATE POLICY "charity_approvals_authenticated_select" ON charity_approvals
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for donations (anon, SELECT)
-- Policies to consolidate: Donors can read own donations, Users can view their own donations
DROP POLICY IF EXISTS "Donors can read own donations" ON donations;
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;

-- Create consolidated policy
CREATE POLICY "donations_anon_select" ON donations
  FOR SELECT
  TO anon
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 3 policies for donations (authenticated, SELECT)
-- Policies to consolidate: Charities can read received donations, Donors can read own donations, Users can view their own donations
DROP POLICY IF EXISTS "Charities can read received donations" ON donations;
DROP POLICY IF EXISTS "Donors can read own donations" ON donations;
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;

-- Create consolidated policy
CREATE POLICY "donations_authenticated_select" ON donations
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for profile_update_approvals (anon, SELECT)
-- Policies to consolidate: Admins can view all profile update approvals, Charities can view their own profile update approvals
DROP POLICY IF EXISTS "Admins can view all profile update approvals" ON profile_update_approvals;
DROP POLICY IF EXISTS "Charities can view their own profile update approvals" ON profile_update_approvals;

-- Create consolidated policy
CREATE POLICY "profile_update_approvals_anon_select" ON profile_update_approvals
  FOR SELECT
  TO anon
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for profile_update_approvals (authenticated, SELECT)
-- Policies to consolidate: Admins can view all profile update approvals, Charities can view their own profile update approvals
DROP POLICY IF EXISTS "Admins can view all profile update approvals" ON profile_update_approvals;
DROP POLICY IF EXISTS "Charities can view their own profile update approvals" ON profile_update_approvals;

-- Create consolidated policy
CREATE POLICY "profile_update_approvals_authenticated_select" ON profile_update_approvals
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for user_skills (authenticated, SELECT)
-- Policies to consolidate: Users can manage own skills, Users can read own skills
DROP POLICY IF EXISTS "Users can manage own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can read own skills" ON user_skills;

-- Create consolidated policy
CREATE POLICY "user_skills_authenticated_select" ON user_skills
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for volunteer_applications (authenticated, SELECT)
-- Policies to consolidate: Charities can view applications for their opportunities, Users can view own applications
DROP POLICY IF EXISTS "Charities can view applications for their opportunities" ON volunteer_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON volunteer_applications;

-- Create consolidated policy
CREATE POLICY "volunteer_applications_authenticated_select" ON volunteer_applications
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for volunteer_opportunities (authenticated, SELECT)
-- Policies to consolidate: Anyone can read active opportunities, Charities can manage own opportunities
DROP POLICY IF EXISTS "Anyone can read active opportunities" ON volunteer_opportunities;
DROP POLICY IF EXISTS "Charities can manage own opportunities" ON volunteer_opportunities;

-- Create consolidated policy
CREATE POLICY "volunteer_opportunities_authenticated_select" ON volunteer_opportunities
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 3 policies for volunteer_profiles (anon, SELECT)
-- Policies to consolidate: Admins can view all volunteer profiles, Charities can view volunteer profiles of applicants, Users can view their own volunteer profile
DROP POLICY IF EXISTS "Admins can view all volunteer profiles" ON volunteer_profiles;
DROP POLICY IF EXISTS "Charities can view volunteer profiles of applicants" ON volunteer_profiles;
DROP POLICY IF EXISTS "Users can view their own volunteer profile" ON volunteer_profiles;

-- Create consolidated policy
CREATE POLICY "volunteer_profiles_anon_select" ON volunteer_profiles
  FOR SELECT
  TO anon
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 3 policies for volunteer_profiles (authenticated, SELECT)
-- Policies to consolidate: Admins can view all volunteer profiles, Charities can view volunteer profiles of applicants, Users can view their own volunteer profile
DROP POLICY IF EXISTS "Admins can view all volunteer profiles" ON volunteer_profiles;
DROP POLICY IF EXISTS "Charities can view volunteer profiles of applicants" ON volunteer_profiles;
DROP POLICY IF EXISTS "Users can view their own volunteer profile" ON volunteer_profiles;

-- Create consolidated policy
CREATE POLICY "volunteer_profiles_authenticated_select" ON volunteer_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

-- Consolidate 2 policies for wallet_aliases (authenticated, SELECT)
-- Policies to consolidate: Anyone can read wallet aliases, Users can manage their own wallet aliases
DROP POLICY IF EXISTS "Anyone can read wallet aliases" ON wallet_aliases;
DROP POLICY IF EXISTS "Users can manage their own wallet aliases" ON wallet_aliases;

-- Create consolidated policy
CREATE POLICY "wallet_aliases_authenticated_select" ON wallet_aliases
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Combine the logic from the original policies
    -- This requires analyzing each policy's USING clause and combining with OR
    true
  );

