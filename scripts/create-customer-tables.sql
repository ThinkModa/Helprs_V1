-- Customer Management Database Schema
-- This script creates the customers and customer_jobs tables

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  customer_id VARCHAR(50) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  last_job_title VARCHAR(255),
  last_job_date TIMESTAMP WITH TIME ZONE,
  total_jobs INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  
  -- Constraints
  UNIQUE(company_id, customer_id),
  UNIQUE(company_id, email)
);

-- Create customer_jobs table
CREATE TABLE IF NOT EXISTS customer_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  job_title VARCHAR(255) NOT NULL,
  job_date TIMESTAMP WITH TIME ZONE NOT NULL,
  job_time TIME,
  duration_hours DECIMAL(4,2),
  location TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'pending')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add customer_id foreign key to appointments table (if not already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(company_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(company_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(company_id, first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_customer_jobs_customer_id ON customer_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_jobs_company_id ON customer_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_jobs_appointment_id ON customer_jobs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_customer_jobs_date ON customer_jobs(job_date);
CREATE INDEX IF NOT EXISTS idx_customer_jobs_status ON customer_jobs(status);

CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_jobs_updated_at ON customer_jobs;
CREATE TRIGGER update_customer_jobs_updated_at
  BEFORE UPDATE ON customer_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for multi-tenant isolation
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_jobs ENABLE ROW LEVEL SECURITY;

-- Customers RLS policies
DROP POLICY IF EXISTS "Users can view customers in their company" ON customers;
CREATE POLICY "Users can view customers in their company" ON customers
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert customers in their company" ON customers;
CREATE POLICY "Users can insert customers in their company" ON customers
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update customers in their company" ON customers;
CREATE POLICY "Users can update customers in their company" ON customers
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete customers in their company" ON customers;
CREATE POLICY "Users can delete customers in their company" ON customers
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Customer Jobs RLS policies
DROP POLICY IF EXISTS "Users can view customer jobs in their company" ON customer_jobs;
CREATE POLICY "Users can view customer jobs in their company" ON customer_jobs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert customer jobs in their company" ON customer_jobs;
CREATE POLICY "Users can insert customer jobs in their company" ON customer_jobs
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update customer jobs in their company" ON customer_jobs;
CREATE POLICY "Users can update customer jobs in their company" ON customer_jobs
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete customer jobs in their company" ON customer_jobs;
CREATE POLICY "Users can delete customer jobs in their company" ON customer_jobs
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create function to automatically update customer stats when jobs are added/updated/deleted
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update customer stats
    UPDATE customers SET
      total_jobs = (
        SELECT COUNT(*) FROM customer_jobs 
        WHERE customer_id = NEW.customer_id AND status = 'completed'
      ),
      total_spent = (
        SELECT COALESCE(SUM(amount), 0) FROM customer_jobs 
        WHERE customer_id = NEW.customer_id AND status = 'completed'
      ),
      last_job_date = (
        SELECT MAX(job_date) FROM customer_jobs 
        WHERE customer_id = NEW.customer_id AND status = 'completed'
      ),
      last_job_title = (
        SELECT job_title FROM customer_jobs 
        WHERE customer_id = NEW.customer_id AND status = 'completed'
        ORDER BY job_date DESC LIMIT 1
      ),
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- Update customer stats after deletion
    UPDATE customers SET
      total_jobs = (
        SELECT COUNT(*) FROM customer_jobs 
        WHERE customer_id = OLD.customer_id AND status = 'completed'
      ),
      total_spent = (
        SELECT COALESCE(SUM(amount), 0) FROM customer_jobs 
        WHERE customer_id = OLD.customer_id AND status = 'completed'
      ),
      last_job_date = (
        SELECT MAX(job_date) FROM customer_jobs 
        WHERE customer_id = OLD.customer_id AND status = 'completed'
      ),
      last_job_title = (
        SELECT job_title FROM customer_jobs 
        WHERE customer_id = OLD.customer_id AND status = 'completed'
        ORDER BY job_date DESC LIMIT 1
      ),
      updated_at = NOW()
    WHERE id = OLD.customer_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update customer stats
DROP TRIGGER IF EXISTS update_customer_stats_on_job_change ON customer_jobs;
CREATE TRIGGER update_customer_stats_on_job_change
  AFTER INSERT OR UPDATE OR DELETE ON customer_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to insert sample data

/*
INSERT INTO customers (company_id, first_name, last_name, email, phone, customer_id, address, city, state, zip_code, status, notes, created_by) VALUES
('master-template', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(555) 123-4567', 'CUST-001', '123 Main Street', 'Springfield', 'IL', '62701', 'active', 'Prefers morning appointments. Has two cats.', 'user-master-admin'),
('master-template', 'Michael', 'Chen', 'michael.chen@email.com', '(555) 234-5678', 'CUST-002', '456 Oak Avenue', 'Springfield', 'IL', '62702', 'active', 'Only available on weekends.', 'user-master-admin'),
('master-template', 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '(555) 345-6789', 'CUST-003', '789 Pine Street', 'Springfield', 'IL', '62703', 'inactive', 'Moved to new location.', 'user-master-admin');
*/

COMMENT ON TABLE customers IS 'Customer information and contact details for each company';
COMMENT ON TABLE customer_jobs IS 'Job history and details for each customer';
COMMENT ON COLUMN customers.customer_id IS 'Company-specific customer identifier (e.g., CUST-001)';
COMMENT ON COLUMN customers.total_jobs IS 'Automatically calculated total number of completed jobs';
COMMENT ON COLUMN customers.total_spent IS 'Automatically calculated total amount spent by customer';
COMMENT ON COLUMN customer_jobs.rating IS 'Customer rating from 1-5 stars';
COMMENT ON COLUMN customer_jobs.review IS 'Customer review text';

