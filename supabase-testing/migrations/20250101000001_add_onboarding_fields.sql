-- Add onboarding fields to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Rename size_range to employee_range if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'size_range') THEN
        ALTER TABLE companies RENAME COLUMN size_range TO employee_range;
    END IF;
END $$;

-- Create a table for pending worker invitations
CREATE TABLE IF NOT EXISTS worker_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'employee',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, email)
);

-- Create index for worker invitations
CREATE INDEX IF NOT EXISTS idx_worker_invitations_company_id ON worker_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_worker_invitations_email ON worker_invitations(email);
CREATE INDEX IF NOT EXISTS idx_worker_invitations_token ON worker_invitations(token);
