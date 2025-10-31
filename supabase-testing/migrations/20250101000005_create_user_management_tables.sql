-- Create User Management Tables
-- This migration adds tables for user profiles, positions, and user-calendar assignments

-- Create positions table (company-specific job positions)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6' NOT NULL, -- Default blue color
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(company_id, name) -- Ensure position names are unique within a company
);

-- Add new columns to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' NOT NULL,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update the role constraint to match our specifications
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('admin', 'manager', 'supervisor', 'general'));

-- Add status constraint
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_status_check 
CHECK (status IN ('active', 'inactive', 'archived', 'terminated'));

-- Create user_calendar_assignments junction table
CREATE TABLE user_calendar_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, calendar_id) -- Prevent duplicate assignments
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_positions_company_id ON positions(company_id);
CREATE INDEX IF NOT EXISTS idx_positions_active ON positions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_id ON user_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_position_id ON user_profiles(position_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_assignments_user_id ON user_calendar_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_assignments_calendar_id ON user_calendar_assignments(calendar_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_assignments_active ON user_calendar_assignments(is_active);

-- Create function to generate employee IDs
CREATE OR REPLACE FUNCTION generate_employee_id(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  company_prefix TEXT;
  next_number INTEGER;
  employee_id TEXT;
BEGIN
  -- Get company prefix (first 3 letters of company name, uppercase)
  SELECT UPPER(LEFT(name, 3)) INTO company_prefix
  FROM companies 
  WHERE id = company_uuid;
  
  -- Get the next number for this company
  SELECT COALESCE(MAX(CAST(SUBSTRING(user_profiles.employee_id FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM user_profiles 
  WHERE company_id = company_uuid 
  AND user_profiles.employee_id IS NOT NULL 
  AND user_profiles.employee_id ~ ('^' || company_prefix || '-[0-9]+$');
  
  -- Format the employee ID
  employee_id := company_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN employee_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate employee IDs
CREATE OR REPLACE FUNCTION trigger_generate_employee_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if employee_id is not provided
  IF NEW.employee_id IS NULL AND NEW.company_id IS NOT NULL THEN
    NEW.employee_id := generate_employee_id(NEW.company_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_generate_employee_id
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_employee_id();

-- Create updated_at triggers
CREATE TRIGGER trigger_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_calendar_assignments_updated_at
  BEFORE UPDATE ON user_calendar_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (commented out for development)
-- When RLS is re-enabled, these policies will be needed:

/*
-- Positions RLS policies
CREATE POLICY "Users can view positions in their company"
  ON positions FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins and managers can manage positions in their company"
  ON positions FOR ALL
  USING (company_id IN (
    SELECT company_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- User profiles RLS policies (update existing)
CREATE POLICY "Users can view profiles in their company"
  ON user_profiles FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins and managers can manage profiles in their company"
  ON user_profiles FOR ALL
  USING (company_id IN (
    SELECT company_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- User calendar assignments RLS policies
CREATE POLICY "Users can view calendar assignments in their company"
  ON user_calendar_assignments FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles 
    WHERE company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Admins and managers can manage calendar assignments in their company"
  ON user_calendar_assignments FOR ALL
  USING (user_id IN (
    SELECT id FROM user_profiles 
    WHERE company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  ));
*/

-- Sample data for development (commented out to avoid conflicts)
/*
-- Sample positions for master template
INSERT INTO positions (company_id, name, description, color, created_by) VALUES
  ('master-template', 'Crew Member', 'General team member responsible for service delivery', '#F59E0B', 'user-master-admin'),
  ('master-template', 'Team Lead', 'Senior team member who leads and coordinates crew activities', '#10B981', 'user-master-admin'),
  ('master-template', 'Site Manager', 'Manages operations at specific locations or service areas', '#3B82F6', 'user-master-admin'),
  ('master-template', 'Specialist', 'Expert in specific service areas or equipment', '#8B5CF6', 'user-master-admin');
*/
