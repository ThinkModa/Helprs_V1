-- Create payment tables for multi-tenant payment processing
-- This migration creates the foundation for Stripe Connect integration

-- Company payment settings (one per company)
CREATE TABLE IF NOT EXISTS company_payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_account_id VARCHAR UNIQUE,
  stripe_account_status VARCHAR DEFAULT 'pending' CHECK (stripe_account_status IN ('pending', 'active', 'restricted', 'rejected')),
  platform_fee_percentage DECIMAL(3,2) DEFAULT 2.50 CHECK (platform_fee_percentage >= 0 AND platform_fee_percentage <= 100),
  payout_schedule VARCHAR DEFAULT 'weekly' CHECK (payout_schedule IN ('daily', 'weekly', 'monthly')),
  auto_pay_workers BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one payment setting per company
  UNIQUE(company_id)
);

-- Worker payment settings (one per worker)
CREATE TABLE IF NOT EXISTS worker_payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_account_id VARCHAR,
  bank_account_verified BOOLEAN DEFAULT false,
  payout_method VARCHAR DEFAULT 'bank_account' CHECK (payout_method IN ('bank_account', 'debit_card')),
  tax_form_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one payment setting per worker per company
  UNIQUE(worker_id, company_id)
);

-- Payment transactions (all payments in/out)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('customer_payment', 'worker_payout', 'refund', 'chargeback')),
  stripe_payment_intent_id VARCHAR,
  stripe_transfer_id VARCHAR,
  stripe_charge_id VARCHAR,
  
  -- Customer payment fields
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES scheduled_appointments(id) ON DELETE SET NULL,
  
  -- Worker payout fields
  worker_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Financial details
  gross_amount DECIMAL(10,2) NOT NULL CHECK (gross_amount >= 0),
  platform_fee DECIMAL(10,2) DEFAULT 0 CHECK (platform_fee >= 0),
  stripe_fee DECIMAL(10,2) DEFAULT 0 CHECK (stripe_fee >= 0),
  net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount >= 0),
  
  -- Status and metadata
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'disputed')),
  currency VARCHAR DEFAULT 'usd' CHECK (currency IN ('usd', 'eur', 'gbp', 'cad')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods (customer cards, worker bank accounts)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('card', 'bank_account', 'debit_card')),
  is_default BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either customer_id or worker_id is set, but not both
  CHECK (
    (customer_id IS NOT NULL AND worker_id IS NULL) OR 
    (customer_id IS NULL AND worker_id IS NOT NULL)
  )
);

-- Payout schedules (recurring worker payments)
CREATE TABLE IF NOT EXISTS payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  schedule_type VARCHAR NOT NULL CHECK (schedule_type IN ('weekly', 'bi_weekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0-6 for weekly
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31), -- 1-31 for monthly
  is_active BOOLEAN DEFAULT true,
  next_payout_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one active schedule per worker per company
  UNIQUE(worker_id, company_id) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_payment_settings_company_id ON company_payment_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_payment_settings_stripe_account_id ON company_payment_settings(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_worker_payment_settings_worker_id ON worker_payment_settings(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_payment_settings_company_id ON worker_payment_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_worker_payment_settings_stripe_account_id ON worker_payment_settings(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_company_id ON payment_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_id ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_worker_id ON payment_transactions(worker_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_appointment_id ON payment_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_transfer_id ON payment_transactions(stripe_transfer_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_company_id ON payment_methods(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_worker_id ON payment_methods(worker_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_payment_method_id ON payment_methods(stripe_payment_method_id);

CREATE INDEX IF NOT EXISTS idx_payout_schedules_company_id ON payout_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_worker_id ON payout_schedules(worker_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_next_payout_date ON payout_schedules(next_payout_date);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_is_active ON payout_schedules(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_company_payment_settings_updated_at 
    BEFORE UPDATE ON company_payment_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_payment_settings_updated_at 
    BEFORE UPDATE ON worker_payment_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE company_payment_settings IS 'Payment configuration and Stripe Connect account details for each company';
COMMENT ON TABLE worker_payment_settings IS 'Payment settings and Stripe account details for each worker';
COMMENT ON TABLE payment_transactions IS 'All payment transactions including customer payments and worker payouts';
COMMENT ON TABLE payment_methods IS 'Payment methods (cards, bank accounts) for customers and workers';
COMMENT ON TABLE payout_schedules IS 'Recurring payout schedules for workers';

COMMENT ON COLUMN company_payment_settings.platform_fee_percentage IS 'Percentage fee charged by the platform (e.g., 2.50 for 2.5%)';
COMMENT ON COLUMN payment_transactions.gross_amount IS 'Total amount before any fees';
COMMENT ON COLUMN payment_transactions.platform_fee IS 'Fee charged by the platform';
COMMENT ON COLUMN payment_transactions.stripe_fee IS 'Fee charged by Stripe';
COMMENT ON COLUMN payment_transactions.net_amount IS 'Amount after all fees (what the recipient actually gets)';

