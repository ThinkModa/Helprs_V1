-- Update user_role enum to include supervisor and general
-- This must be done in a separate migration due to PostgreSQL limitations

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'general';
