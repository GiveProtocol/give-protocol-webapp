CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  charity_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  commitment VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  work_language VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID NOT NULL,
  charity_id UUID NOT NULL,
  opportunity_id UUID,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0),
  date_performed DATE NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL,
  applicant_id UUID NOT NULL,
  charity_id UUID NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID NOT NULL,
  charity_id UUID NOT NULL,
  volunteer_hours_id UUID,
  application_id UUID,
  verification_method VARCHAR(50) NOT NULL,
  acceptance_hash VARCHAR(255),
  verification_hash VARCHAR(255),
  accepted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_by UUID,
  nft_token_id BIGINT,
  blockchain_tx_hash VARCHAR(255),
  blockchain_reference JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_hours_charity_id ON volunteer_hours(charity_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_status ON volunteer_hours(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_hours_volunteer_id ON volunteer_hours(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_charity_id ON volunteer_opportunities(charity_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_status ON volunteer_opportunities(status);

ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Charities can read volunteer hours for their charity" ON volunteer_hours;
DROP POLICY IF EXISTS "Volunteers can read own volunteer hours" ON volunteer_hours;
DROP POLICY IF EXISTS "Volunteers can insert own volunteer hours" ON volunteer_hours;
DROP POLICY IF EXISTS "Charities can update volunteer hours for their charity" ON volunteer_hours;
DROP POLICY IF EXISTS "Anyone can view active opportunities" ON volunteer_opportunities;
DROP POLICY IF EXISTS "Charities can manage own opportunities" ON volunteer_opportunities;

CREATE POLICY "Charities can read volunteer hours for their charity" ON volunteer_hours
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = volunteer_hours.charity_id 
      AND profiles.user_id = auth.uid() 
      AND profiles.type = 'charity'
    )
  );

CREATE POLICY "Volunteers can read own volunteer hours" ON volunteer_hours
  FOR SELECT
  TO authenticated
  USING (volunteer_id = auth.uid());

CREATE POLICY "Volunteers can insert own volunteer hours" ON volunteer_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (volunteer_id = auth.uid());

CREATE POLICY "Charities can update volunteer hours for their charity" ON volunteer_hours
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = volunteer_hours.charity_id 
      AND profiles.user_id = auth.uid() 
      AND profiles.type = 'charity'
    )
  );

CREATE POLICY "Anyone can view active opportunities" ON volunteer_opportunities
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Charities can manage own opportunities" ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = volunteer_opportunities.charity_id 
      AND profiles.user_id = auth.uid() 
      AND profiles.type = 'charity'
    )
  );