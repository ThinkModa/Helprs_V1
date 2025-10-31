-- Create customers and scheduling tables
-- This migration creates the customer management and scheduling infrastructure

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  customer_id TEXT NOT NULL, -- Company-specific customer ID (e.g., CUST-001)
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  last_job_title TEXT,
  last_job_date DATE,
  total_jobs INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Ensure customer IDs are unique within a company
  UNIQUE(company_id, customer_id)
);

-- Customer jobs table (job history)
CREATE TABLE IF NOT EXISTS customer_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  job_date DATE NOT NULL,
  job_time TIME,
  duration_hours DECIMAL(4,2),
  location TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'pending')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled appointments table (actual scheduled work)
CREATE TABLE IF NOT EXISTS scheduled_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  required_workers INTEGER DEFAULT 1 CHECK (required_workers >= 1 AND required_workers <= 9),
  assigned_workers INTEGER DEFAULT 0 CHECK (assigned_workers >= 0),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment services junction table
CREATE TABLE IF NOT EXISTS appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE, -- Using appointments as services
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scheduled_appointment_id, service_id)
);

-- Appointment workers junction table
CREATE TABLE IF NOT EXISTS appointment_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'worker',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(scheduled_appointment_id, worker_id)
);

-- Note: appointment_forms table already exists in workforce_tables migration
-- This table links scheduled_appointments to forms (different from the existing appointment_forms)
-- We'll create a separate table for scheduled appointment forms
CREATE TABLE IF NOT EXISTS scheduled_appointment_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scheduled_appointment_id, form_id)
);

-- Appointment notes table
CREATE TABLE IF NOT EXISTS appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'customer_feedback', 'worker_feedback', 'issue', 'resolution')),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring appointments table (for future use)
CREATE TABLE IF NOT EXISTS recurring_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
  recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval >= 1),
  days_of_week INTEGER[], -- Array of days (0-6) for weekly recurrence
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location TEXT,
  required_workers INTEGER DEFAULT 1 CHECK (required_workers >= 1 AND required_workers <= 9),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

CREATE INDEX IF NOT EXISTS idx_customer_jobs_company_id ON customer_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_jobs_customer_id ON customer_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_jobs_appointment_id ON customer_jobs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_customer_jobs_job_date ON customer_jobs(job_date);

CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_company_id ON scheduled_appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_customer_id ON scheduled_appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_scheduled_date ON scheduled_appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointments_status ON scheduled_appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointment_services_scheduled_appointment_id ON appointment_services(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_services_service_id ON appointment_services(service_id);

CREATE INDEX IF NOT EXISTS idx_appointment_workers_scheduled_appointment_id ON appointment_workers(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_workers_worker_id ON appointment_workers(worker_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_appointment_forms_scheduled_appointment_id ON scheduled_appointment_forms(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_appointment_forms_form_id ON scheduled_appointment_forms(form_id);

CREATE INDEX IF NOT EXISTS idx_appointment_notes_scheduled_appointment_id ON appointment_notes(scheduled_appointment_id);

CREATE INDEX IF NOT EXISTS idx_recurring_appointments_company_id ON recurring_appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_customer_id ON recurring_appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_is_active ON recurring_appointments(is_active);

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_jobs_updated_at 
    BEFORE UPDATE ON customer_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_appointments_updated_at 
    BEFORE UPDATE ON scheduled_appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_appointments_updated_at 
    BEFORE UPDATE ON recurring_appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE customers IS 'Customer profiles and contact information for each company';
COMMENT ON TABLE customer_jobs IS 'Job history and ratings for customers';
COMMENT ON TABLE scheduled_appointments IS 'Actual scheduled appointments with customers';
COMMENT ON TABLE appointment_services IS 'Junction table linking scheduled appointments to services';
COMMENT ON TABLE appointment_workers IS 'Junction table linking scheduled appointments to workers';
COMMENT ON TABLE scheduled_appointment_forms IS 'Junction table linking scheduled appointments to forms';
COMMENT ON TABLE appointment_notes IS 'Notes and feedback for scheduled appointments';
COMMENT ON TABLE recurring_appointments IS 'Recurring appointment templates for future use';
