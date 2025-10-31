-- Row Level Security (RLS) policies for payment tables
-- Ensures complete tenant isolation for payment data

-- Enable RLS on all payment tables
ALTER TABLE company_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedules ENABLE ROW LEVEL SECURITY;

-- Company Payment Settings Policies
-- Companies can only see and modify their own payment settings
CREATE POLICY "Companies can view their own payment settings" 
ON company_payment_settings FOR SELECT 
USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can insert their own payment settings" 
ON company_payment_settings FOR INSERT 
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can update their own payment settings" 
ON company_payment_settings FOR UPDATE 
USING (company_id = current_setting('app.current_company_id')::uuid)
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can delete their own payment settings" 
ON company_payment_settings FOR DELETE 
USING (company_id = current_setting('app.current_company_id')::uuid);

-- Worker Payment Settings Policies
-- Companies can see all worker payment settings within their company
-- Workers can only see their own payment settings
CREATE POLICY "Companies can view worker payment settings in their company" 
ON worker_payment_settings FOR SELECT 
USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can insert worker payment settings for their workers" 
ON worker_payment_settings FOR INSERT 
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can update worker payment settings in their company" 
ON worker_payment_settings FOR UPDATE 
USING (company_id = current_setting('app.current_company_id')::uuid)
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can delete worker payment settings in their company" 
ON worker_payment_settings FOR DELETE 
USING (company_id = current_setting('app.current_company_id')::uuid);

-- Workers can view their own payment settings
CREATE POLICY "Workers can view their own payment settings" 
ON worker_payment_settings FOR SELECT 
USING (worker_id = auth.uid());

-- Workers can update their own payment settings (limited fields)
CREATE POLICY "Workers can update their own payment settings" 
ON worker_payment_settings FOR UPDATE 
USING (worker_id = auth.uid())
WITH CHECK (worker_id = auth.uid());

-- Payment Transactions Policies
-- Companies can see all transactions within their company
-- Workers can only see transactions related to them
CREATE POLICY "Companies can view all payment transactions in their company" 
ON payment_transactions FOR SELECT 
USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can insert payment transactions for their company" 
ON payment_transactions FOR INSERT 
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can update payment transactions in their company" 
ON payment_transactions FOR UPDATE 
USING (company_id = current_setting('app.current_company_id')::uuid)
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can delete payment transactions in their company" 
ON payment_transactions FOR DELETE 
USING (company_id = current_setting('app.current_company_id')::uuid);

-- Workers can view transactions where they are the recipient
CREATE POLICY "Workers can view their own payment transactions" 
ON payment_transactions FOR SELECT 
USING (worker_id = auth.uid());

-- Payment Methods Policies
-- Companies can see all payment methods within their company
-- Customers can only see their own payment methods
-- Workers can only see their own payment methods
CREATE POLICY "Companies can view all payment methods in their company" 
ON payment_methods FOR SELECT 
USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can insert payment methods for their company" 
ON payment_methods FOR INSERT 
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can update payment methods in their company" 
ON payment_methods FOR UPDATE 
USING (company_id = current_setting('app.current_company_id')::uuid)
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can delete payment methods in their company" 
ON payment_methods FOR DELETE 
USING (company_id = current_setting('app.current_company_id')::uuid);

-- Customers can view their own payment methods
CREATE POLICY "Customers can view their own payment methods" 
ON payment_methods FOR SELECT 
USING (customer_id IN (
  SELECT id FROM customers 
  WHERE company_id = current_setting('app.current_company_id')::uuid
));

-- Workers can view their own payment methods
CREATE POLICY "Workers can view their own payment methods" 
ON payment_methods FOR SELECT 
USING (worker_id = auth.uid());

-- Payout Schedules Policies
-- Companies can see all payout schedules within their company
-- Workers can only see their own payout schedules
CREATE POLICY "Companies can view all payout schedules in their company" 
ON payout_schedules FOR SELECT 
USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can insert payout schedules for their workers" 
ON payout_schedules FOR INSERT 
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can update payout schedules in their company" 
ON payout_schedules FOR UPDATE 
USING (company_id = current_setting('app.current_company_id')::uuid)
WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "Companies can delete payout schedules in their company" 
ON payout_schedules FOR DELETE 
USING (company_id = current_setting('app.current_company_id')::uuid);

-- Workers can view their own payout schedules
CREATE POLICY "Workers can view their own payout schedules" 
ON payout_schedules FOR SELECT 
USING (worker_id = auth.uid());

-- Workers can update their own payout schedules (limited fields)
CREATE POLICY "Workers can update their own payout schedules" 
ON payout_schedules FOR UPDATE 
USING (worker_id = auth.uid())
WITH CHECK (worker_id = auth.uid());

-- Add comments for documentation
COMMENT ON POLICY "Companies can view their own payment settings" ON company_payment_settings IS 'Ensures companies can only access their own payment configuration';
COMMENT ON POLICY "Companies can view all payment transactions in their company" ON payment_transactions IS 'Allows companies to see all financial transactions within their organization';
COMMENT ON POLICY "Workers can view their own payment transactions" ON payment_transactions IS 'Allows workers to see only transactions where they are the recipient';
COMMENT ON POLICY "Companies can view all payment methods in their company" ON payment_methods IS 'Allows companies to manage all payment methods for their customers and workers';
COMMENT ON POLICY "Workers can view their own payment methods" ON payment_methods IS 'Allows workers to see only their own payment methods';

