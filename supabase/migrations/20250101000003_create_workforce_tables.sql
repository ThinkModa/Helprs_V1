-- =====================================================
-- WORKFORCE MANAGEMENT TABLES
-- Calendars, Appointments, Forms, and Junction Tables
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CALENDARS TABLE
-- =====================================================
-- Calendars represent organizational units (teams, locations, service areas, etc.)
CREATE TABLE calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Default blue color
  calendar_type TEXT DEFAULT 'team', -- 'team', 'location', 'service_area', 'specialization'
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Additional calendar-specific data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- =====================================================
-- 2. APPOINTMENTS TABLE
-- =====================================================
-- Appointments represent scheduled work/services
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT DEFAULT 'service', -- 'service', 'meeting', 'maintenance', etc.
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Scheduling
  scheduled_start TIMESTAMP NOT NULL,
  scheduled_end TIMESTAMP NOT NULL,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  
  -- Location
  location_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  coordinates POINT, -- PostGIS point for mapping
  
  -- Customer/Client
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Assignment
  assigned_worker_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  assigned_team_id UUID REFERENCES calendars(id) ON DELETE SET NULL,
  
  -- Pricing
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. FORMS TABLE
-- =====================================================
-- Forms represent data collection templates
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT DEFAULT 'checklist', -- 'checklist', 'survey', 'inspection', 'contact'
  is_active BOOLEAN DEFAULT true,
  
  -- Form structure (JSON schema for dynamic forms)
  form_schema JSONB NOT NULL DEFAULT '{}',
  
  -- Settings
  is_required BOOLEAN DEFAULT false,
  allow_multiple_submissions BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- =====================================================
-- 4. JUNCTION TABLES
-- =====================================================

-- Appointment ↔ Calendar (Many-to-Many)
-- Allows appointments to be assigned to multiple calendars
CREATE TABLE appointment_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(appointment_id, calendar_id)
);

-- Appointment ↔ Form (Many-to-Many)
-- Allows appointments to have multiple forms attached
CREATE TABLE appointment_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(appointment_id, form_id)
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Calendars indexes
CREATE INDEX idx_calendars_company_id ON calendars(company_id);
CREATE INDEX idx_calendars_calendar_type ON calendars(calendar_type);
CREATE INDEX idx_calendars_is_active ON calendars(is_active);
CREATE INDEX idx_calendars_sort_order ON calendars(sort_order);

-- Appointments indexes
CREATE INDEX idx_appointments_company_id ON appointments(company_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_priority ON appointments(priority);
CREATE INDEX idx_appointments_scheduled_start ON appointments(scheduled_start);
CREATE INDEX idx_appointments_scheduled_end ON appointments(scheduled_end);
CREATE INDEX idx_appointments_assigned_worker_id ON appointments(assigned_worker_id);
CREATE INDEX idx_appointments_assigned_team_id ON appointments(assigned_team_id);
CREATE INDEX idx_appointments_customer_email ON appointments(customer_email);

-- Forms indexes
CREATE INDEX idx_forms_company_id ON forms(company_id);
CREATE INDEX idx_forms_form_type ON forms(form_type);
CREATE INDEX idx_forms_is_active ON forms(is_active);

-- Junction table indexes
CREATE INDEX idx_appointment_calendars_appointment_id ON appointment_calendars(appointment_id);
CREATE INDEX idx_appointment_calendars_calendar_id ON appointment_calendars(calendar_id);
CREATE INDEX idx_appointment_forms_appointment_id ON appointment_forms(appointment_id);
CREATE INDEX idx_appointment_forms_form_id ON appointment_forms(form_id);

-- =====================================================
-- 6. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Updated_at trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_calendars_updated_at BEFORE UPDATE ON calendars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. RLS POLICIES (DISABLED FOR DEVELOPMENT)
-- =====================================================

-- Note: RLS policies are commented out for development environment
-- Uncomment and modify these for staging/production

/*
-- Calendars RLS
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view calendars from their company" ON calendars
  FOR SELECT USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can create calendars for their company" ON calendars
  FOR INSERT WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can update calendars from their company" ON calendars
  FOR UPDATE USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can delete calendars from their company" ON calendars
  FOR DELETE USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Appointments RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view appointments from their company" ON appointments
  FOR SELECT USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can create appointments for their company" ON appointments
  FOR INSERT WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can update appointments from their company" ON appointments
  FOR UPDATE USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can delete appointments from their company" ON appointments
  FOR DELETE USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Forms RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view forms from their company" ON forms
  FOR SELECT USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can create forms for their company" ON forms
  FOR INSERT WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can update forms from their company" ON forms
  FOR UPDATE USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));
CREATE POLICY "Users can delete forms from their company" ON forms
  FOR DELETE USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Junction tables RLS
ALTER TABLE appointment_calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage appointment_calendars from their company" ON appointment_calendars
  FOR ALL USING (appointment_id IN (
    SELECT id FROM appointments WHERE company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  ));

ALTER TABLE appointment_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage appointment_forms from their company" ON appointment_forms
  FOR ALL USING (appointment_id IN (
    SELECT id FROM appointments WHERE company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  ));
*/

-- =====================================================
-- 8. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Note: Sample data will be inserted after companies are created
-- This section is commented out to avoid UUID conflicts during migration
-- Sample data can be inserted via the application or separate seed scripts

/*
-- Insert sample calendars for testing (after companies exist)
INSERT INTO calendars (company_id, name, description, color, calendar_type, sort_order) VALUES
  ((SELECT id FROM companies LIMIT 1), 'House Cleaning Team', 'Team responsible for residential cleaning services', '#10B981', 'team', 1),
  ((SELECT id FROM companies LIMIT 1), 'Office Cleaning Team', 'Team responsible for commercial cleaning services', '#3B82F6', 'team', 2),
  ((SELECT id FROM companies LIMIT 1), 'Downtown Area', 'All work in the downtown district', '#F59E0B', 'location', 3),
  ((SELECT id FROM companies LIMIT 1), 'North Side', 'All work in the northern part of the city', '#EF4444', 'location', 4);

-- Insert sample forms for testing (after companies exist)
INSERT INTO forms (company_id, name, description, form_type, form_schema) VALUES
  ((SELECT id FROM companies LIMIT 1), 'Contact Information', 'Basic customer contact details', 'contact', '{"fields": [{"name": "name", "type": "text", "required": true}, {"name": "email", "type": "email", "required": true}, {"name": "phone", "type": "tel", "required": false}]}'),
  ((SELECT id FROM companies LIMIT 1), 'Cleaning Checklist', 'Standard cleaning completion checklist', 'checklist', '{"fields": [{"name": "rooms_cleaned", "type": "number", "required": true}, {"name": "quality_rating", "type": "select", "options": ["Excellent", "Good", "Fair", "Poor"], "required": true}]}'),
  ((SELECT id FROM companies LIMIT 1), 'Safety Inspection', 'Safety checklist for work completion', 'inspection', '{"fields": [{"name": "safety_equipment", "type": "checkbox", "required": true}, {"name": "hazards_identified", "type": "textarea", "required": false}]}');

-- Insert sample appointments for testing (after companies exist)
INSERT INTO appointments (company_id, title, description, appointment_type, status, priority, scheduled_start, scheduled_end, location_name, customer_name, customer_email) VALUES
  ((SELECT id FROM companies LIMIT 1), 'House Cleaning - 123 Main St', 'Weekly house cleaning service', 'service', 'scheduled', 'medium', '2024-01-15 09:00:00', '2024-01-15 12:00:00', '123 Main St', 'John Smith', 'john@example.com'),
  ((SELECT id FROM companies LIMIT 1), 'Office Cleaning - Downtown', 'Monthly office cleaning', 'service', 'scheduled', 'low', '2024-01-16 18:00:00', '2024-01-16 21:00:00', '456 Business Ave', 'Jane Doe', 'jane@company.com');

-- Link appointments to calendars (many-to-many)
INSERT INTO appointment_calendars (appointment_id, calendar_id) VALUES
  ((SELECT id FROM appointments WHERE title = 'House Cleaning - 123 Main St'), (SELECT id FROM calendars WHERE name = 'House Cleaning Team')),
  ((SELECT id FROM appointments WHERE title = 'House Cleaning - 123 Main St'), (SELECT id FROM calendars WHERE name = 'Downtown Area')),
  ((SELECT id FROM appointments WHERE title = 'Office Cleaning - Downtown'), (SELECT id FROM calendars WHERE name = 'Office Cleaning Team')),
  ((SELECT id FROM appointments WHERE title = 'Office Cleaning - Downtown'), (SELECT id FROM calendars WHERE name = 'Downtown Area'));

-- Link appointments to forms (many-to-many)
INSERT INTO appointment_forms (appointment_id, form_id, is_required, sort_order) VALUES
  ((SELECT id FROM appointments WHERE title = 'House Cleaning - 123 Main St'), (SELECT id FROM forms WHERE name = 'Contact Information'), true, 1),
  ((SELECT id FROM appointments WHERE title = 'House Cleaning - 123 Main St'), (SELECT id FROM forms WHERE name = 'Cleaning Checklist'), true, 2),
  ((SELECT id FROM appointments WHERE title = 'Office Cleaning - Downtown'), (SELECT id FROM forms WHERE name = 'Contact Information'), true, 1),
  ((SELECT id FROM appointments WHERE title = 'Office Cleaning - Downtown'), (SELECT id FROM forms WHERE name = 'Safety Inspection'), true, 2);
*/
