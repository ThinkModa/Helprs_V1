export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          website: string | null
          logo_url: string | null
          industry: string | null
          employee_range: string | null
          city: string | null
          state: string | null
          subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise'
          subscription_status: string
          subscription_start_date: string | null
          subscription_end_date: string | null
          billing_email: string | null
          billing_address: any | null
          settings: any
          location_coordinates: any | null
          timezone: string
          is_active: boolean
          is_master_account: boolean
          is_test_company: boolean
          is_internal_company: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          industry?: string | null
          employee_range?: string | null
          city?: string | null
          state?: string | null
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise'
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          billing_email?: string | null
          billing_address?: any | null
          settings?: any
          location_coordinates?: any | null
          timezone?: string
          is_active?: boolean
          is_master_account?: boolean
          is_test_company?: boolean
          is_internal_company?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          industry?: string | null
          employee_range?: string | null
          city?: string | null
          state?: string | null
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise'
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          billing_email?: string | null
          billing_address?: any | null
          settings?: any
          location_coordinates?: any | null
          timezone?: string
          is_active?: boolean
          is_master_account?: boolean
          is_test_company?: boolean
          is_internal_company?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'supervisor' | 'general'
          department: string | null
          job_title: string | null
          employee_id: string | null
          mobile_number: string | null
          start_date: string | null
          position_id: string | null
          status: 'active' | 'inactive' | 'archived' | 'terminated'
          profile_picture_url: string | null
          hire_date: string | null
          is_active: boolean
          last_login_at: string | null
          preferences: any
          metadata: any
          location_coordinates: any | null
          timezone: string
          wage_type: 'hourly' | 'salary'
          hourly_rate: number | null
          salary_amount: number | null
          payment_preference: 'per_job' | 'weekly' | 'bi_weekly'
          payment_day_of_week: number | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id: string
          company_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'supervisor' | 'general'
          department?: string | null
          job_title?: string | null
          employee_id?: string | null
          mobile_number?: string | null
          start_date?: string | null
          position_id?: string | null
          status?: 'active' | 'inactive' | 'archived' | 'terminated'
          profile_picture_url?: string | null
          hire_date?: string | null
          is_active?: boolean
          last_login_at?: string | null
          preferences?: any
          location_coordinates?: any | null
          timezone?: string
          wage_type?: 'hourly' | 'salary'
          hourly_rate?: number | null
          salary_amount?: number | null
          payment_preference?: 'per_job' | 'weekly' | 'bi_weekly'
          payment_day_of_week?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'supervisor' | 'general'
          department?: string | null
          job_title?: string | null
          employee_id?: string | null
          mobile_number?: string | null
          start_date?: string | null
          position_id?: string | null
          status?: 'active' | 'inactive' | 'archived' | 'terminated'
          profile_picture_url?: string | null
          hire_date?: string | null
          is_active?: boolean
          last_login_at?: string | null
          preferences?: any
          metadata?: any
          location_coordinates?: any | null
          timezone?: string
          wage_type?: 'hourly' | 'salary'
          hourly_rate?: number | null
          salary_amount?: number | null
          payment_preference?: 'per_job' | 'weekly' | 'bi_weekly'
          payment_day_of_week?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      feature_flags: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          category: 'core' | 'advanced' | 'enterprise'
          required_tier: 'free' | 'basic' | 'professional' | 'enterprise'
          is_enabled_by_default: boolean
          is_system_flag: boolean
          configuration: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          category: 'core' | 'advanced' | 'enterprise'
          required_tier: 'free' | 'basic' | 'professional' | 'enterprise'
          is_enabled_by_default?: boolean
          is_system_flag?: boolean
          configuration?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          category?: 'core' | 'advanced' | 'enterprise'
          required_tier?: 'free' | 'basic' | 'professional' | 'enterprise'
          is_enabled_by_default?: boolean
          is_system_flag?: boolean
          configuration?: any
          created_at?: string
          updated_at?: string
        }
      }
      tenant_feature_flags: {
        Row: {
          id: string
          company_id: string
          feature_flag_id: string
          is_enabled: boolean
          configuration: any
          enabled_at: string | null
          enabled_by: string | null
          rollout_stage: string | null
          rollout_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          feature_flag_id: string
          is_enabled: boolean
          configuration?: any
          enabled_at?: string | null
          enabled_by?: string | null
          rollout_stage?: string | null
          rollout_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          feature_flag_id?: string
          is_enabled?: boolean
          configuration?: any
          enabled_at?: string | null
          enabled_by?: string | null
          rollout_stage?: string | null
          rollout_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      tenant_configurations: {
        Row: {
          id: string
          company_id: string
          config_key: string
          config_value: any
          description: string | null
          is_system_config: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          config_key: string
          config_value: any
          description?: string | null
          is_system_config?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          config_key?: string
          config_value?: any
          description?: string | null
          is_system_config?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          company_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          location_coordinates: any | null
          is_active: boolean
          expires_at: string
          created_at: string
          last_accessed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          is_active?: boolean
          expires_at: string
          created_at?: string
          last_accessed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          is_active?: boolean
          expires_at?: string
          created_at?: string
          last_accessed_at?: string
        }
      }
      security_events: {
        Row: {
          id: string
          user_id: string | null
          company_id: string
          event_type: 'failed_login' | 'suspicious_activity' | 'data_breach_attempt' | 'unauthorized_access' | 'rate_limit_exceeded' | 'account_locked' | 'password_reset' | 'two_factor_enabled' | 'two_factor_disabled'
          severity: string
          description: string | null
          ip_address: string | null
          user_agent: string | null
          location_coordinates: any | null
          metadata: any
          resolved_at: string | null
          resolved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_id: string
          event_type: 'failed_login' | 'suspicious_activity' | 'data_breach_attempt' | 'unauthorized_access' | 'rate_limit_exceeded' | 'account_locked' | 'password_reset' | 'two_factor_enabled' | 'two_factor_disabled'
          severity?: string
          description?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          metadata?: any
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company_id?: string
          event_type?: 'failed_login' | 'suspicious_activity' | 'data_breach_attempt' | 'unauthorized_access' | 'rate_limit_exceeded' | 'account_locked' | 'password_reset' | 'two_factor_enabled' | 'two_factor_disabled'
          severity?: string
          description?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          metadata?: any
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          company_id: string
          table_name: string
          record_id: string | null
          action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change' | 'data_export' | 'data_import'
          old_values: any | null
          new_values: any | null
          ip_address: string | null
          user_agent: string | null
          location_coordinates: any | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_id: string
          table_name: string
          record_id?: string | null
          action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change' | 'data_export' | 'data_import'
          old_values?: any | null
          new_values?: any | null
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company_id?: string
          table_name?: string
          record_id?: string | null
          action?: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change' | 'data_export' | 'data_import'
          old_values?: any | null
          new_values?: any | null
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          metadata?: any
          created_at?: string
        }
      }
      notification_templates: {
        Row: {
          id: string
          name: string
          type: 'system' | 'user' | 'security' | 'billing' | 'feature_update' | 'maintenance'
          subject: string
          body: string
          variables: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'system' | 'user' | 'security' | 'billing' | 'feature_update' | 'maintenance'
          subject: string
          body: string
          variables?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'system' | 'user' | 'security' | 'billing' | 'feature_update' | 'maintenance'
          subject?: string
          body?: string
          variables?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_notifications: {
        Row: {
          id: string
          user_id: string
          company_id: string
          template_id: string | null
          type: 'system' | 'user' | 'security' | 'billing' | 'feature_update' | 'maintenance'
          subject: string
          body: string
          is_read: boolean
          is_sent: boolean
          sent_at: string | null
          read_at: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          template_id?: string | null
          type: 'system' | 'user' | 'security' | 'billing' | 'feature_update' | 'maintenance'
          subject: string
          body: string
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          read_at?: string | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          template_id?: string | null
          type?: 'system' | 'user' | 'security' | 'billing' | 'feature_update' | 'maintenance'
          subject?: string
          body?: string
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          read_at?: string | null
          metadata?: any
          created_at?: string
        }
      }
      system_metrics: {
        Row: {
          id: string
          company_id: string
          metric_name: string
          metric_value: number
          metric_unit: string | null
          tags: any
          recorded_at: string
        }
        Insert: {
          id?: string
          company_id: string
          metric_name: string
          metric_value: number
          metric_unit?: string | null
          tags?: any
          recorded_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          metric_name?: string
          metric_value?: number
          metric_unit?: string | null
          tags?: any
          recorded_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          company_id: string
          activity_type: string
          activity_description: string | null
          resource_type: string | null
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          location_coordinates: any | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          activity_type: string
          activity_description?: string | null
          resource_type?: string | null
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          activity_type?: string
          activity_description?: string | null
          resource_type?: string | null
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location_coordinates?: any | null
          metadata?: any
          created_at?: string
        }
      }
      worker_invitations: {
        Row: {
          id: string
          company_id: string
          email: string
          role: 'owner' | 'admin' | 'manager' | 'employee'
          invited_by: string | null
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          role?: 'owner' | 'admin' | 'manager' | 'employee'
          invited_by?: string | null
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          role?: 'owner' | 'admin' | 'manager' | 'employee'
          invited_by?: string | null
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      calendars: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          color: string
          calendar_type: string
          is_active: boolean
          sort_order: number
          metadata: any
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          color?: string
          calendar_type?: string
          is_active?: boolean
          sort_order?: number
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          color?: string
          calendar_type?: string
          is_active?: boolean
          sort_order?: number
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      services: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          appointment_type: string
          status: string
          priority: string
          scheduled_start: string
          scheduled_end: string
          actual_start: string | null
          actual_end: string | null
          location_name: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          coordinates: any | null
          customer_id: string | null
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          assigned_worker_id: string | null
          assigned_team_id: string | null
          estimated_cost: number | null
          actual_cost: number | null
          currency: string
          metadata: any
          notes: string | null
          requires_deposit: boolean
          deposit_amount: number | null
          deposit_type: 'fixed' | 'percentage' | null
          pricing_type: 'hourly' | 'fixed'
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          appointment_type?: string
          status?: string
          priority?: string
          scheduled_start: string
          scheduled_end: string
          actual_start?: string | null
          actual_end?: string | null
          location_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          coordinates?: any | null
          customer_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          assigned_worker_id?: string | null
          assigned_team_id?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          currency?: string
          metadata?: any
          notes?: string | null
          requires_deposit?: boolean
          deposit_amount?: number | null
          deposit_type?: 'fixed' | 'percentage' | null
          pricing_type?: 'hourly' | 'fixed'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          appointment_type?: string
          status?: string
          priority?: string
          scheduled_start?: string
          scheduled_end?: string
          actual_start?: string | null
          actual_end?: string | null
          location_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          coordinates?: any | null
          customer_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          assigned_worker_id?: string | null
          assigned_team_id?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          currency?: string
          metadata?: any
          notes?: string | null
          requires_deposit?: boolean
          deposit_amount?: number | null
          deposit_type?: 'fixed' | 'percentage' | null
          pricing_type?: 'hourly' | 'fixed'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      forms: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          form_type: string
          is_active: boolean
          form_schema: any
          is_required: boolean
          allow_multiple_submissions: boolean
          expires_at: string | null
          metadata: any
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          form_type?: string
          is_active?: boolean
          form_schema?: any
          is_required?: boolean
          allow_multiple_submissions?: boolean
          expires_at?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          form_type?: string
          is_active?: boolean
          form_schema?: any
          is_required?: boolean
          allow_multiple_submissions?: boolean
          expires_at?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      appointment_calendars: {
        Row: {
          id: string
          appointment_id: string
          calendar_id: string
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          calendar_id: string
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          calendar_id?: string
          created_at?: string
        }
      }
      appointment_forms: {
        Row: {
          id: string
          appointment_id: string
          form_id: string
          is_required: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          form_id: string
          is_required?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          form_id?: string
          is_required?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          color: string
          is_active: boolean
          sort_order: number
          metadata: any
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          color?: string
          is_active?: boolean
          sort_order?: number
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          color?: string
          is_active?: boolean
          sort_order?: number
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      user_calendar_assignments: {
        Row: {
          id: string
          user_id: string
          calendar_id: string
          assigned_at: string
          assigned_by: string | null
          is_active: boolean
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calendar_id: string
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calendar_id?: string
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          customer_id: string
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          status: 'active' | 'inactive' | 'archived'
          last_job_title: string | null
          last_job_date: string | null
          total_jobs: number
          total_spent: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          customer_id: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          status?: 'active' | 'inactive' | 'archived'
          last_job_title?: string | null
          last_job_date?: string | null
          total_jobs?: number
          total_spent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          customer_id?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          status?: 'active' | 'inactive' | 'archived'
          last_job_title?: string | null
          last_job_date?: string | null
          total_jobs?: number
          total_spent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      customer_jobs: {
        Row: {
          id: string
          company_id: string
          customer_id: string
          appointment_id: string | null
          job_title: string
          job_date: string
          job_time: string | null
          duration_hours: number | null
          location: string | null
          amount: number
          status: 'completed' | 'cancelled' | 'pending'
          rating: number | null
          review: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          customer_id: string
          appointment_id?: string | null
          job_title: string
          job_date: string
          job_time?: string | null
          duration_hours?: number | null
          location?: string | null
          amount: number
          status?: 'completed' | 'cancelled' | 'pending'
          rating?: number | null
          review?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          customer_id?: string
          appointment_id?: string | null
          job_title?: string
          job_date?: string
          job_time?: string | null
          duration_hours?: number | null
          location?: string | null
          amount?: number
          status?: 'completed' | 'cancelled' | 'pending'
          rating?: number | null
          review?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_appointments: {
        Row: {
          id: string
          company_id: string
          customer_id: string
          title: string
          description: string | null
          scheduled_date: string
          start_time: string
          end_time: string
          duration_minutes: number
          location: string | null
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          required_workers: number
          assigned_workers: number
          deposit_paid: boolean
          deposit_transaction_id: string | null
          final_payment_status: 'pending' | 'approved' | 'paid' | 'disputed'
          final_payment_transaction_id: string | null
          estimated_cost: number | null
          actual_cost: number | null
          customer_approved_hours: boolean
          customer_approved_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          customer_id: string
          title: string
          description?: string | null
          scheduled_date: string
          start_time: string
          end_time: string
          duration_minutes: number
          location?: string | null
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          required_workers?: number
          assigned_workers?: number
          deposit_paid?: boolean
          deposit_transaction_id?: string | null
          final_payment_status?: 'pending' | 'approved' | 'paid' | 'disputed'
          final_payment_transaction_id?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          customer_approved_hours?: boolean
          customer_approved_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          customer_id?: string
          title?: string
          description?: string | null
          scheduled_date?: string
          start_time?: string
          end_time?: string
          duration_minutes?: number
          location?: string | null
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          required_workers?: number
          assigned_workers?: number
          deposit_paid?: boolean
          deposit_transaction_id?: string | null
          final_payment_status?: 'pending' | 'approved' | 'paid' | 'disputed'
          final_payment_transaction_id?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          customer_approved_hours?: boolean
          customer_approved_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointment_services: {
        Row: {
          id: string
          scheduled_appointment_id: string
          service_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          scheduled_appointment_id: string
          service_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          scheduled_appointment_id?: string
          service_id?: string
          quantity?: number
          created_at?: string
        }
      }
      appointment_workers: {
        Row: {
          id: string
          scheduled_appointment_id: string
          worker_id: string
          role: string
          assigned_at: string
          assigned_by: string | null
          is_confirmed: boolean
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          scheduled_appointment_id: string
          worker_id: string
          role?: string
          assigned_at?: string
          assigned_by?: string | null
          is_confirmed?: boolean
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          scheduled_appointment_id?: string
          worker_id?: string
          role?: string
          assigned_at?: string
          assigned_by?: string | null
          is_confirmed?: boolean
          confirmed_at?: string | null
        }
      }
      appointment_forms: {
        Row: {
          id: string
          scheduled_appointment_id: string
          form_id: string
          is_required: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          scheduled_appointment_id: string
          form_id: string
          is_required?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          scheduled_appointment_id?: string
          form_id?: string
          is_required?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      appointment_notes: {
        Row: {
          id: string
          scheduled_appointment_id: string
          note: string
          note_type: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          scheduled_appointment_id: string
          note: string
          note_type?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          scheduled_appointment_id?: string
          note?: string
          note_type?: string
          created_by?: string | null
          created_at?: string
        }
      }
      recurring_appointments: {
        Row: {
          id: string
          company_id: string
          customer_id: string
          title: string
          description: string | null
          recurrence_pattern: string
          recurrence_interval: number
          days_of_week: number[] | null
          start_date: string
          end_date: string | null
          start_time: string
          duration_minutes: number
          location: string | null
          required_workers: number
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          customer_id: string
          title: string
          description?: string | null
          recurrence_pattern: string
          recurrence_interval?: number
          days_of_week?: number[] | null
          start_date: string
          end_date?: string | null
          start_time: string
          duration_minutes: number
          location?: string | null
          required_workers?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          customer_id?: string
          title?: string
          description?: string | null
          recurrence_pattern?: string
          recurrence_interval?: number
          days_of_week?: number[] | null
          start_date?: string
          end_date?: string | null
          start_time?: string
          duration_minutes?: number
          location?: string | null
          required_workers?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_payment_settings: {
        Row: {
          id: string
          company_id: string
          stripe_account_id: string | null
          stripe_account_status: 'pending' | 'active' | 'restricted' | 'rejected'
          platform_fee_percentage: number
          payout_schedule: 'daily' | 'weekly' | 'monthly'
          auto_pay_workers: boolean
          allow_worker_payment_preference: boolean
          default_worker_payment_schedule: 'per_job' | 'weekly' | 'bi_weekly'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          stripe_account_id?: string | null
          stripe_account_status?: 'pending' | 'active' | 'restricted' | 'rejected'
          platform_fee_percentage?: number
          payout_schedule?: 'daily' | 'weekly' | 'monthly'
          auto_pay_workers?: boolean
          allow_worker_payment_preference?: boolean
          default_worker_payment_schedule?: 'per_job' | 'weekly' | 'bi_weekly'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          stripe_account_id?: string | null
          stripe_account_status?: 'pending' | 'active' | 'restricted' | 'rejected'
          platform_fee_percentage?: number
          payout_schedule?: 'daily' | 'weekly' | 'monthly'
          auto_pay_workers?: boolean
          allow_worker_payment_preference?: boolean
          default_worker_payment_schedule?: 'per_job' | 'weekly' | 'bi_weekly'
          created_at?: string
          updated_at?: string
        }
      }
      worker_payment_settings: {
        Row: {
          id: string
          worker_id: string
          company_id: string
          stripe_account_id: string | null
          bank_account_verified: boolean
          payout_method: 'bank_account' | 'debit_card'
          tax_form_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          company_id: string
          stripe_account_id?: string | null
          bank_account_verified?: boolean
          payout_method?: 'bank_account' | 'debit_card'
          tax_form_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          company_id?: string
          stripe_account_id?: string | null
          bank_account_verified?: boolean
          payout_method?: 'bank_account' | 'debit_card'
          tax_form_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          company_id: string
          transaction_type: 'customer_payment' | 'worker_payout' | 'refund' | 'chargeback'
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          stripe_charge_id: string | null
          customer_id: string | null
          appointment_id: string | null
          worker_id: string | null
          gross_amount: number
          platform_fee: number
          stripe_fee: number
          net_amount: number
          status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed'
          currency: string
          description: string | null
          metadata: any
          time_entry_id: string | null
          is_deposit: boolean
          is_final_payment: boolean
          aggregation_period_start: string | null
          aggregation_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          transaction_type: 'customer_payment' | 'worker_payout' | 'refund' | 'chargeback'
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          stripe_charge_id?: string | null
          customer_id?: string | null
          appointment_id?: string | null
          worker_id?: string | null
          gross_amount: number
          platform_fee?: number
          stripe_fee?: number
          net_amount: number
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed'
          currency?: string
          description?: string | null
          metadata?: any
          time_entry_id?: string | null
          is_deposit?: boolean
          is_final_payment?: boolean
          aggregation_period_start?: string | null
          aggregation_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          transaction_type?: 'customer_payment' | 'worker_payout' | 'refund' | 'chargeback'
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          stripe_charge_id?: string | null
          customer_id?: string | null
          appointment_id?: string | null
          worker_id?: string | null
          gross_amount?: number
          platform_fee?: number
          stripe_fee?: number
          net_amount?: number
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed'
          currency?: string
          description?: string | null
          metadata?: any
          time_entry_id?: string | null
          is_deposit?: boolean
          is_final_payment?: boolean
          aggregation_period_start?: string | null
          aggregation_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          company_id: string
          customer_id: string | null
          worker_id: string | null
          stripe_payment_method_id: string
          type: 'card' | 'bank_account' | 'debit_card'
          is_default: boolean
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          customer_id?: string | null
          worker_id?: string | null
          stripe_payment_method_id: string
          type: 'card' | 'bank_account' | 'debit_card'
          is_default?: boolean
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          customer_id?: string | null
          worker_id?: string | null
          stripe_payment_method_id?: string
          type?: 'card' | 'bank_account' | 'debit_card'
          is_default?: boolean
          metadata?: any
          created_at?: string
        }
      }
      payout_schedules: {
        Row: {
          id: string
          company_id: string
          worker_id: string
          schedule_type: 'weekly' | 'bi_weekly' | 'monthly'
          day_of_week: number | null
          day_of_month: number | null
          is_active: boolean
          next_payout_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          worker_id: string
          schedule_type: 'weekly' | 'bi_weekly' | 'monthly'
          day_of_week?: number | null
          day_of_month?: number | null
          is_active?: boolean
          next_payout_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          worker_id?: string
          schedule_type?: 'weekly' | 'bi_weekly' | 'monthly'
          day_of_week?: number | null
          day_of_month?: number | null
          is_active?: boolean
          next_payout_date?: string | null
          created_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          company_id: string
          scheduled_appointment_id: string
          worker_id: string
          clock_in_time: string
          clock_out_time: string | null
          hours_worked: number | null
          hourly_rate_at_time: number | null
          wage_type_at_time: string | null
          total_amount: number | null
          payment_status: 'pending' | 'paid' | 'scheduled'
          payment_transaction_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          scheduled_appointment_id: string
          worker_id: string
          clock_in_time: string
          clock_out_time?: string | null
          hours_worked?: number | null
          hourly_rate_at_time?: number | null
          wage_type_at_time?: string | null
          total_amount?: number | null
          payment_status?: 'pending' | 'paid' | 'scheduled'
          payment_transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          scheduled_appointment_id?: string
          worker_id?: string
          clock_in_time?: string
          clock_out_time?: string | null
          hours_worked?: number | null
          hourly_rate_at_time?: number | null
          wage_type_at_time?: string | null
          total_amount?: number | null
          payment_status?: 'pending' | 'paid' | 'scheduled'
          payment_transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: {
        Args: {
          user_uuid: string
        }
        Returns: string
      }
      user_has_permission: {
        Args: {
          user_uuid: string
          required_role: 'owner' | 'admin' | 'manager' | 'employee'
        }
        Returns: boolean
      }
      get_feature_flag: {
        Args: {
          company_uuid: string
          flag_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise'
      user_role: 'owner' | 'admin' | 'manager' | 'employee'
      feature_category: 'core' | 'advanced' | 'enterprise'
      audit_action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change' | 'data_export' | 'data_import'
      security_event_type: 'failed_login' | 'suspicious_activity' | 'data_breach_attempt' | 'unauthorized_access' | 'rate_limit_exceeded' | 'account_locked' | 'password_reset' | 'two_factor_enabled' | 'two_factor_disabled'
      notification_type: 'system' | 'user' | 'security' | 'billing' | 'feature_update' | 'maintenance'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
