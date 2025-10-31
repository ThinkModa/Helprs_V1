-- Add or update LIVE feature flags used by Activation Wizard and Feature Flags UI
-- Safe to run multiple times due to ON CONFLICT on (name)

INSERT INTO feature_flags (name, display_name, description, category, required_tier, is_enabled_by_default)
VALUES
  ('scheduling', 'Scheduling', 'Scheduling clients & jobs', 'core', 'free', true),
  ('worker_self_schedule', 'Worker Self-scheduling', 'Workers can self-schedule via the mobile app', 'core', 'free', true),
  ('direct_communication', 'Direct Communication', 'In-app messaging between workers and clients', 'advanced', 'professional', false),
  ('payments', 'Payment Management', 'Accept, track, and payout payments for jobs and workers', 'advanced', 'enterprise', false),
  ('analytics', 'Company Analytics', 'Reports, KPIs, exports, and product usage analytics', 'advanced', 'professional', false),
  ('insights_chat', 'AI Insights Chat', 'AI-powered analytics chat and insights for admins', 'enterprise', 'enterprise', false)
ON CONFLICT (name) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  required_tier = EXCLUDED.required_tier,
  is_enabled_by_default = EXCLUDED.is_enabled_by_default,
  updated_at = NOW();



