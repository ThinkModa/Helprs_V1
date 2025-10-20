-- =====================================================
-- SEED DATA FOR DEVELOPMENT
-- This file is automatically run after migrations
-- =====================================================

-- Note: This seed file will be run automatically after migrations
-- For more complex seeding, use the JavaScript seed script: npm run seed

-- Insert default feature flags if they don't exist
INSERT INTO feature_flags (id, name, display_name, description, category, required_tier, is_enabled_by_default, is_system_flag, sort_order) VALUES
  ('flag-001', 'job_management', 'Job Management', 'Core job scheduling and management features', 'core', 'free', true, false, 1),
  ('flag-002', 'worker_management', 'Worker Management', 'Worker profiles and availability management', 'core', 'free', true, false, 2),
  ('flag-003', 'customer_management', 'Customer Management', 'Customer database and relationship management', 'core', 'free', true, false, 3),
  ('flag-004', 'time_tracking', 'Time Tracking', 'Clock in/out and time entry features', 'core', 'basic', true, false, 4),
  ('flag-005', 'payment_processing', 'Payment Processing', 'Stripe integration and payment handling', 'advanced', 'professional', false, false, 5),
  ('flag-006', 'advanced_reporting', 'Advanced Reporting', 'Analytics and reporting dashboard', 'advanced', 'professional', false, false, 6),
  ('flag-007', 'custom_forms', 'Custom Forms', 'Dynamic form builder and data collection', 'advanced', 'basic', true, false, 7),
  ('flag-008', 'api_access', 'API Access', 'REST API access for integrations', 'enterprise', 'enterprise', false, false, 8),
  ('flag-009', 'white_labeling', 'White Labeling', 'Custom branding and domain options', 'enterprise', 'enterprise', false, false, 9),
  ('flag-010', 'priority_support', 'Priority Support', '24/7 priority customer support', 'enterprise', 'enterprise', false, false, 10)
ON CONFLICT (id) DO NOTHING;

-- Insert default configuration template
INSERT INTO configuration_templates (id, name, description, template_data, is_default) VALUES
  ('template-001', 'Default Configuration', 'Standard configuration for new tenants', 
   '{"ui_theme": "light", "timezone": "UTC", "date_format": "MM/DD/YYYY", "currency": "USD", "language": "en"}', 
   true)
ON CONFLICT (id) DO NOTHING;

-- Insert default notification templates
INSERT INTO notification_templates (id, name, type, subject, body, variables, is_active) VALUES
  ('notif-001', 'welcome_email', 'user', 'Welcome to {{company_name}}', 
   'Welcome {{user_name}}! You have been added to {{company_name}} workspace.', 
   '["company_name", "user_name"]', true),
  ('notif-002', 'job_assigned', 'user', 'New Job Assigned', 
   'You have been assigned to a new job: {{job_title}}', 
   '["job_title"]', true),
  ('notif-003', 'system_maintenance', 'system', 'Scheduled Maintenance', 
   'The system will be undergoing maintenance on {{maintenance_date}} from {{start_time}} to {{end_time}}.', 
   '["maintenance_date", "start_time", "end_time"]', true)
ON CONFLICT (id) DO NOTHING;

-- Note: User accounts and companies are created via the JavaScript seed script
-- This ensures proper authentication setup and avoids conflicts
