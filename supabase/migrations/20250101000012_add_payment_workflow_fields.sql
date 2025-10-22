-- Add Payment Workflow Fields
-- This migration adds fields to support the complete payment workflow including
-- deposits, time tracking, worker payouts, and customer approval

-- =====================================================
-- 1. SERVICES TABLE - Add deposit and pricing fields
-- =====================================================

-- Add deposit configuration fields
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS requires_deposit BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_type VARCHAR CHECK (deposit_type IN ('fixed', 'percentage'));
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pricing_type VARCHAR DEFAULT 'hourly' CHECK (pricing_type IN ('hourly', 'fixed'));

-- Add comments for documentation
COMMENT ON COLUMN appointments.requires_deposit IS 'Whether this service requires a deposit from customers';
COMMENT ON COLUMN appointments.deposit_amount IS 'Deposit amount (fixed amount or percentage of total)';
COMMENT ON COLUMN appointments.deposit_type IS 'Whether deposit is a fixed amount or percentage';
COMMENT ON COLUMN appointments.pricing_type IS 'Whether service is priced hourly or at a fixed rate';

-- =====================================================
-- 2. USER_PROFILES TABLE - Add worker payment fields
-- =====================================================

-- Add wage and payment preference fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wage_type VARCHAR DEFAULT 'hourly' CHECK (wage_type IN ('hourly', 'salary'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS salary_amount DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS payment_preference VARCHAR DEFAULT 'weekly' CHECK (payment_preference IN ('per_job', 'weekly', 'bi_weekly'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS payment_day_of_week INTEGER CHECK (payment_day_of_week >= 0 AND payment_day_of_week <= 6);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.wage_type IS 'Whether worker is paid hourly or salary';
COMMENT ON COLUMN user_profiles.hourly_rate IS 'Hourly rate for hourly workers';
COMMENT ON COLUMN user_profiles.salary_amount IS 'Fixed salary amount for salary workers';
COMMENT ON COLUMN user_profiles.payment_preference IS 'When worker prefers to be paid (per job, weekly, bi-weekly)';
COMMENT ON COLUMN user_profiles.payment_day_of_week IS 'Day of week for weekly payments (0=Sunday, 6=Saturday)';

-- =====================================================
-- 3. COMPANY_PAYMENT_SETTINGS TABLE - Add admin controls
-- =====================================================

-- Add master override controls
ALTER TABLE company_payment_settings ADD COLUMN IF NOT EXISTS allow_worker_payment_preference BOOLEAN DEFAULT true;
ALTER TABLE company_payment_settings ADD COLUMN IF NOT EXISTS default_worker_payment_schedule VARCHAR DEFAULT 'weekly' CHECK (default_worker_payment_schedule IN ('per_job', 'weekly', 'bi_weekly'));

-- Add comments for documentation
COMMENT ON COLUMN company_payment_settings.allow_worker_payment_preference IS 'Whether workers can choose their own payment schedule';
COMMENT ON COLUMN company_payment_settings.default_worker_payment_schedule IS 'Default payment schedule when worker preferences are disabled';

-- =====================================================
-- 4. SCHEDULED_APPOINTMENTS TABLE - Add payment tracking
-- =====================================================

-- Add payment status and tracking fields
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false;
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS deposit_transaction_id UUID REFERENCES payment_transactions(id);
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS final_payment_status VARCHAR DEFAULT 'pending' CHECK (final_payment_status IN ('pending', 'approved', 'paid', 'disputed'));
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS final_payment_transaction_id UUID REFERENCES payment_transactions(id);
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2);
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2);
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS customer_approved_hours BOOLEAN DEFAULT false;
ALTER TABLE scheduled_appointments ADD COLUMN IF NOT EXISTS customer_approved_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN scheduled_appointments.deposit_paid IS 'Whether customer has paid the required deposit';
COMMENT ON COLUMN scheduled_appointments.deposit_transaction_id IS 'Reference to the deposit payment transaction';
COMMENT ON COLUMN scheduled_appointments.final_payment_status IS 'Status of final payment (pending, approved, paid, disputed)';
COMMENT ON COLUMN scheduled_appointments.final_payment_transaction_id IS 'Reference to the final payment transaction';
COMMENT ON COLUMN scheduled_appointments.estimated_cost IS 'Original estimated cost for the appointment';
COMMENT ON COLUMN scheduled_appointments.actual_cost IS 'Actual cost based on time worked';
COMMENT ON COLUMN scheduled_appointments.customer_approved_hours IS 'Whether customer has approved the final hours/cost';
COMMENT ON COLUMN scheduled_appointments.customer_approved_at IS 'When customer approved the final payment';

-- =====================================================
-- 5. PAYMENT_TRANSACTIONS TABLE - Add workflow fields
-- =====================================================

-- Add workflow tracking fields
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS time_entry_id UUID;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS is_deposit BOOLEAN DEFAULT false;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS is_final_payment BOOLEAN DEFAULT false;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS aggregation_period_start DATE;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS aggregation_period_end DATE;

-- Add comments for documentation
COMMENT ON COLUMN payment_transactions.time_entry_id IS 'Reference to time entry for worker payouts';
COMMENT ON COLUMN payment_transactions.is_deposit IS 'Whether this transaction is a customer deposit';
COMMENT ON COLUMN payment_transactions.is_final_payment IS 'Whether this transaction is the final customer payment';
COMMENT ON COLUMN payment_transactions.aggregation_period_start IS 'Start date for aggregated worker payments (weekly/bi-weekly)';
COMMENT ON COLUMN payment_transactions.aggregation_period_end IS 'End date for aggregated worker payments (weekly/bi-weekly)';

-- =====================================================
-- 6. CREATE TIME_ENTRIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scheduled_appointment_id UUID NOT NULL REFERENCES scheduled_appointments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  hours_worked DECIMAL(4,2), -- Calculated on clock out
  hourly_rate_at_time DECIMAL(10,2), -- Snapshot of rate at clock-in
  wage_type_at_time VARCHAR, -- 'hourly' or 'salary'
  total_amount DECIMAL(10,2), -- Calculated: hours_worked * hourly_rate_at_time
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'scheduled')),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one active time entry per worker per appointment
  UNIQUE(worker_id, scheduled_appointment_id) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_company_id ON time_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_scheduled_appointment_id ON time_entries(scheduled_appointment_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_worker_id ON time_entries(worker_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in_time ON time_entries(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_out_time ON time_entries(clock_out_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_payment_status ON time_entries(payment_status);
CREATE INDEX IF NOT EXISTS idx_time_entries_payment_transaction_id ON time_entries(payment_transaction_id);

-- Add updated_at trigger
CREATE TRIGGER update_time_entries_updated_at 
    BEFORE UPDATE ON time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE time_entries IS 'Time tracking entries for workers on scheduled appointments';
COMMENT ON COLUMN time_entries.hours_worked IS 'Calculated hours worked (clock_out_time - clock_in_time)';
COMMENT ON COLUMN time_entries.hourly_rate_at_time IS 'Snapshot of worker hourly rate at time of clock-in';
COMMENT ON COLUMN time_entries.wage_type_at_time IS 'Snapshot of worker wage type at time of clock-in';
COMMENT ON COLUMN time_entries.total_amount IS 'Calculated amount owed to worker (hours_worked * hourly_rate_at_time)';
COMMENT ON COLUMN time_entries.payment_status IS 'Status of worker payment for this time entry';

-- =====================================================
-- 7. ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key for time_entry_id in payment_transactions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_payment_transactions_time_entry_id'
    ) THEN
        ALTER TABLE payment_transactions 
        ADD CONSTRAINT fk_payment_transactions_time_entry_id 
        FOREIGN KEY (time_entry_id) REFERENCES time_entries(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to calculate hours worked
CREATE OR REPLACE FUNCTION calculate_hours_worked(clock_in TIMESTAMP WITH TIME ZONE, clock_out TIMESTAMP WITH TIME ZONE)
RETURNS DECIMAL(4,2) AS $$
BEGIN
  IF clock_out IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN ROUND(EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate worker payment amount
CREATE OR REPLACE FUNCTION calculate_worker_payment_amount(
  hours_worked DECIMAL(4,2),
  hourly_rate DECIMAL(10,2),
  wage_type VARCHAR
)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  IF wage_type = 'salary' THEN
    -- For salary workers, return 0 as they get fixed amount regardless of hours
    RETURN 0;
  ELSE
    -- For hourly workers, calculate based on hours worked
    RETURN ROUND(hours_worked * hourly_rate, 2);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comments for functions
COMMENT ON FUNCTION calculate_hours_worked IS 'Calculates hours worked between clock in and clock out times';
COMMENT ON FUNCTION calculate_worker_payment_amount IS 'Calculates payment amount for worker based on hours and rate';
