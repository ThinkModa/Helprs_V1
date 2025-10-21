-- Scheduling System Database Schema
-- This script creates the scheduling tables and renames appointments to services

-- Step 1: Rename appointments table to services
ALTER TABLE appointments RENAME TO services;

-- Step 2: Create scheduled_appointments table
CREATE TABLE IF NOT EXISTS scheduled_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location TEXT,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  required_workers INTEGER DEFAULT 1 CHECK (required_workers >= 1 AND required_workers <= 9),
  assigned_workers INTEGER DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create appointment_services junction table
CREATE TABLE IF NOT EXISTS appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate service assignments
  UNIQUE(scheduled_appointment_id, service_id)
);

-- Step 4: Create appointment_workers junction table
CREATE TABLE IF NOT EXISTS appointment_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'worker',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure no duplicate worker assignments
  UNIQUE(scheduled_appointment_id, worker_id)
);

-- Step 5: Create appointment_forms junction table
CREATE TABLE IF NOT EXISTS appointment_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate form assignments
  UNIQUE(scheduled_appointment_id, form_id)
);

-- Step 6: Create appointment_notes table
CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create recurring_appointments table
CREATE TABLE IF NOT EXISTS recurring_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  recurrence_pattern VARCHAR(50) NOT NULL CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
  recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval > 0),
  days_of_week INTEGER[], -- [1,3,5] for Mon, Wed, Fri (1=Monday, 7=Sunday)
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location TEXT,
  required_workers INTEGER DEFAULT 1 CHECK (required_workers >= 1 AND required_workers <= 9),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_company_id ON scheduled_appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_customer_id ON scheduled_appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_date ON scheduled_appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_status ON scheduled_appointments(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_date_time ON scheduled_appointments(scheduled_date, start_time);

CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment_id ON appointment_services(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_services_service_id ON appointment_services(service_id);

CREATE INDEX IF NOT EXISTS idx_appointment_workers_appointment_id ON appointment_workers(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_workers_worker_id ON appointment_workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_appointment_workers_confirmed ON appointment_workers(is_confirmed);

CREATE INDEX IF NOT EXISTS idx_appointment_forms_appointment_id ON appointment_forms(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_forms_form_id ON appointment_forms(form_id);

CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id ON appointment_notes(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notes_type ON appointment_notes(note_type);

CREATE INDEX IF NOT EXISTS idx_recurring_appointments_company_id ON recurring_appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_customer_id ON recurring_appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_active ON recurring_appointments(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_pattern ON recurring_appointments(recurrence_pattern);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_scheduled_appointments_updated_at ON scheduled_appointments;
CREATE TRIGGER update_scheduled_appointments_updated_at
  BEFORE UPDATE ON scheduled_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_appointments_updated_at ON recurring_appointments;
CREATE TRIGGER update_recurring_appointments_updated_at
  BEFORE UPDATE ON recurring_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update assigned_workers count
CREATE OR REPLACE FUNCTION update_assigned_workers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update assigned_workers count
    UPDATE scheduled_appointments SET
      assigned_workers = (
        SELECT COUNT(*) FROM appointment_workers 
        WHERE scheduled_appointment_id = NEW.scheduled_appointment_id
      ),
      updated_at = NOW()
    WHERE id = NEW.scheduled_appointment_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- Update assigned_workers count after deletion
    UPDATE scheduled_appointments SET
      assigned_workers = (
        SELECT COUNT(*) FROM appointment_workers 
        WHERE scheduled_appointment_id = OLD.scheduled_appointment_id
      ),
      updated_at = NOW()
    WHERE id = OLD.scheduled_appointment_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update assigned_workers count
DROP TRIGGER IF EXISTS update_assigned_workers_count_on_worker_change ON appointment_workers;
CREATE TRIGGER update_assigned_workers_count_on_worker_change
  AFTER INSERT OR UPDATE OR DELETE ON appointment_workers
  FOR EACH ROW
  EXECUTE FUNCTION update_assigned_workers_count();

-- Create RLS policies for multi-tenant isolation
ALTER TABLE scheduled_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_appointments ENABLE ROW LEVEL SECURITY;

-- Scheduled Appointments RLS policies
DROP POLICY IF EXISTS "Users can view scheduled appointments in their company" ON scheduled_appointments;
CREATE POLICY "Users can view scheduled appointments in their company" ON scheduled_appointments
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert scheduled appointments in their company" ON scheduled_appointments;
CREATE POLICY "Users can insert scheduled appointments in their company" ON scheduled_appointments
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update scheduled appointments in their company" ON scheduled_appointments;
CREATE POLICY "Users can update scheduled appointments in their company" ON scheduled_appointments
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete scheduled appointments in their company" ON scheduled_appointments;
CREATE POLICY "Users can delete scheduled appointments in their company" ON scheduled_appointments
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Appointment Services RLS policies
DROP POLICY IF EXISTS "Users can view appointment services in their company" ON appointment_services;
CREATE POLICY "Users can view appointment services in their company" ON appointment_services
  FOR SELECT USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert appointment services in their company" ON appointment_services;
CREATE POLICY "Users can insert appointment services in their company" ON appointment_services
  FOR INSERT WITH CHECK (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update appointment services in their company" ON appointment_services;
CREATE POLICY "Users can update appointment services in their company" ON appointment_services
  FOR UPDATE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete appointment services in their company" ON appointment_services;
CREATE POLICY "Users can delete appointment services in their company" ON appointment_services
  FOR DELETE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Appointment Workers RLS policies
DROP POLICY IF EXISTS "Users can view appointment workers in their company" ON appointment_workers;
CREATE POLICY "Users can view appointment workers in their company" ON appointment_workers
  FOR SELECT USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert appointment workers in their company" ON appointment_workers;
CREATE POLICY "Users can insert appointment workers in their company" ON appointment_workers
  FOR INSERT WITH CHECK (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update appointment workers in their company" ON appointment_workers;
CREATE POLICY "Users can update appointment workers in their company" ON appointment_workers
  FOR UPDATE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete appointment workers in their company" ON appointment_workers;
CREATE POLICY "Users can delete appointment workers in their company" ON appointment_workers
  FOR DELETE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Appointment Forms RLS policies
DROP POLICY IF EXISTS "Users can view appointment forms in their company" ON appointment_forms;
CREATE POLICY "Users can view appointment forms in their company" ON appointment_forms
  FOR SELECT USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert appointment forms in their company" ON appointment_forms;
CREATE POLICY "Users can insert appointment forms in their company" ON appointment_forms
  FOR INSERT WITH CHECK (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update appointment forms in their company" ON appointment_forms;
CREATE POLICY "Users can update appointment forms in their company" ON appointment_forms
  FOR UPDATE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete appointment forms in their company" ON appointment_forms;
CREATE POLICY "Users can delete appointment forms in their company" ON appointment_forms
  FOR DELETE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Appointment Notes RLS policies
DROP POLICY IF EXISTS "Users can view appointment notes in their company" ON appointment_notes;
CREATE POLICY "Users can view appointment notes in their company" ON appointment_notes
  FOR SELECT USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert appointment notes in their company" ON appointment_notes;
CREATE POLICY "Users can insert appointment notes in their company" ON appointment_notes
  FOR INSERT WITH CHECK (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update appointment notes in their company" ON appointment_notes;
CREATE POLICY "Users can update appointment notes in their company" ON appointment_notes
  FOR UPDATE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete appointment notes in their company" ON appointment_notes;
CREATE POLICY "Users can delete appointment notes in their company" ON appointment_notes
  FOR DELETE USING (
    scheduled_appointment_id IN (
      SELECT id FROM scheduled_appointments 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Recurring Appointments RLS policies
DROP POLICY IF EXISTS "Users can view recurring appointments in their company" ON recurring_appointments;
CREATE POLICY "Users can view recurring appointments in their company" ON recurring_appointments
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert recurring appointments in their company" ON recurring_appointments;
CREATE POLICY "Users can insert recurring appointments in their company" ON recurring_appointments
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update recurring appointments in their company" ON recurring_appointments;
CREATE POLICY "Users can update recurring appointments in their company" ON recurring_appointments
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete recurring appointments in their company" ON recurring_appointments;
CREATE POLICY "Users can delete recurring appointments in their company" ON recurring_appointments
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE services IS 'Service types/templates that can be offered (renamed from appointments)';
COMMENT ON TABLE scheduled_appointments IS 'Actual scheduled appointments for customers';
COMMENT ON TABLE appointment_services IS 'Junction table linking scheduled appointments to services';
COMMENT ON TABLE appointment_workers IS 'Junction table linking scheduled appointments to assigned workers';
COMMENT ON TABLE appointment_forms IS 'Junction table linking scheduled appointments to required forms';
COMMENT ON TABLE appointment_notes IS 'Notes and comments for scheduled appointments';
COMMENT ON TABLE recurring_appointments IS 'Recurring appointment templates for future feature';

COMMENT ON COLUMN scheduled_appointments.required_workers IS 'Number of workers required (1-9)';
COMMENT ON COLUMN scheduled_appointments.assigned_workers IS 'Number of workers currently assigned (auto-calculated)';
COMMENT ON COLUMN scheduled_appointments.status IS 'Appointment status: scheduled -> confirmed -> in_progress -> completed';
COMMENT ON COLUMN recurring_appointments.days_of_week IS 'Array of days (1=Monday, 7=Sunday) for weekly recurrence';
COMMENT ON COLUMN recurring_appointments.recurrence_interval IS 'Interval for recurrence (e.g., every 2 weeks)';
