'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

// Extend Appointment type to include related data for UI display
export interface AppointmentWithDetails extends Appointment {
  assigned_worker_name?: string
  assigned_team_name?: string
  calendar_names?: string[]
  form_names?: string[]
}

export class AppointmentService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient
  }

  // Mock data for demonstration purposes
  private mockAppointments: AppointmentWithDetails[] = [
    {
      id: 'apt-001',
      company_id: 'master-template',
      title: 'House Cleaning Service',
      description: 'Full house cleaning including kitchen, bathrooms, and living areas',
      appointment_type: 'service',
      status: 'scheduled',
      priority: 'medium',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date().toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      coordinates: null,
      customer_name: null,
      customer_email: null,
      customer_phone: null,
      assigned_worker_id: null,
      assigned_team_id: null,
      estimated_cost: 150.00,
      actual_cost: null,
      currency: 'USD',
      metadata: { pricing_type: 'fixed', duration: '3 hours', is_private: false },
      notes: 'Standard house cleaning service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      assigned_worker_name: null,
      assigned_team_name: null,
      calendar_names: ['House Cleaning Team', 'Residential Services'],
      form_names: ['Pre-Cleaning Checklist', 'Customer Satisfaction Survey']
    },
    {
      id: 'apt-002',
      company_id: 'master-template',
      title: 'Office Deep Cleaning',
      description: 'Weekly deep cleaning of office space including restrooms and break room',
      appointment_type: 'service',
      status: 'scheduled',
      priority: 'medium',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date().toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      coordinates: null,
      customer_name: null,
      customer_email: null,
      customer_phone: null,
      assigned_worker_id: null,
      assigned_team_id: null,
      estimated_cost: 75.00,
      actual_cost: null,
      currency: 'USD',
      metadata: { pricing_type: 'hourly', duration: '4 hours', is_private: false },
      notes: 'Commercial office cleaning service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      assigned_worker_name: null,
      assigned_team_name: null,
      calendar_names: ['Office Cleaning Team', 'Downtown Area'],
      form_names: ['Office Cleaning Checklist']
    },
    {
      id: 'apt-003',
      company_id: 'master-template',
      title: 'Plumbing Repair Service',
      description: 'Fix leaky faucets, replace garbage disposal, and general plumbing maintenance',
      appointment_type: 'service',
      status: 'scheduled',
      priority: 'high',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date().toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      coordinates: null,
      customer_name: null,
      customer_email: null,
      customer_phone: null,
      assigned_worker_id: null,
      assigned_team_id: null,
      estimated_cost: 120.00,
      actual_cost: null,
      currency: 'USD',
      metadata: { pricing_type: 'hourly', duration: '2 hours', is_private: false },
      notes: 'Emergency plumbing repair service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      assigned_worker_name: null,
      assigned_team_name: null,
      calendar_names: ['Plumbing Team', 'Residential Services'],
      form_names: ['Plumbing Work Order', 'Customer Feedback Form']
    },
    {
      id: 'apt-004',
      company_id: 'master-template',
      title: 'Carpet Cleaning Service',
      description: 'Deep carpet cleaning for residential and commercial spaces',
      appointment_type: 'service',
      status: 'scheduled',
      priority: 'low',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date().toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      coordinates: null,
      customer_name: null,
      customer_email: null,
      customer_phone: null,
      assigned_worker_id: null,
      assigned_team_id: null,
      estimated_cost: 200.00,
      actual_cost: null,
      currency: 'USD',
      metadata: { pricing_type: 'fixed', duration: '6 hours', is_private: true },
      notes: 'Specialized carpet cleaning service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      assigned_worker_name: null,
      assigned_team_name: null,
      calendar_names: ['House Cleaning Team', 'Office Cleaning Team'],
      form_names: ['Carpet Cleaning Checklist']
    },
    {
      id: 'apt-005',
      company_id: 'master-template',
      title: 'Window Cleaning Service',
      description: 'Professional window cleaning for interior and exterior windows',
      appointment_type: 'service',
      status: 'scheduled',
      priority: 'low',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date().toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      coordinates: null,
      customer_name: null,
      customer_email: null,
      customer_phone: null,
      assigned_worker_id: null,
      assigned_team_id: null,
      estimated_cost: 50.00,
      actual_cost: null,
      currency: 'USD',
      metadata: { pricing_type: 'hourly', duration: '1 hour', is_private: false },
      notes: 'Window cleaning service for all building types',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      assigned_worker_name: null,
      assigned_team_name: null,
      calendar_names: ['House Cleaning Team', 'Office Cleaning Team', 'Downtown Area'],
      form_names: ['Window Cleaning Checklist']
    }
  ]

  async getAppointments(companyId: string): Promise<AppointmentWithDetails[]> {
    // In a real application, you would fetch from Supabase
    // For now, filter mock data by companyId
    return this.mockAppointments.filter(apt => apt.company_id === companyId)
  }

  async getAppointmentById(id: string, companyId: string): Promise<AppointmentWithDetails | null> {
    return this.mockAppointments.find(apt => apt.id === id && apt.company_id === companyId) || null
  }

  async createAppointment(appointment: AppointmentInsert): Promise<AppointmentWithDetails> {
    const newAppointment: AppointmentWithDetails = {
      ...appointment,
      id: `apt-${Math.random().toString(36).substr(2, 9)}`, // Generate a mock ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'mock-user-id', // Replace with actual user ID
      assigned_worker_name: null,
      assigned_team_name: null,
      calendar_names: [],
      form_names: []
    }
    this.mockAppointments.push(newAppointment)
    return newAppointment
  }

  async updateAppointment(id: string, appointment: AppointmentUpdate): Promise<AppointmentWithDetails | null> {
    const index = this.mockAppointments.findIndex(apt => apt.id === id)
    if (index > -1) {
      this.mockAppointments[index] = {
        ...this.mockAppointments[index],
        ...appointment,
        updated_at: new Date().toISOString(),
      }
      return this.mockAppointments[index]
    }
    return null
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const initialLength = this.mockAppointments.length
    this.mockAppointments = this.mockAppointments.filter(apt => apt.id !== id)
    return this.mockAppointments.length < initialLength
  }

  // Helper methods for status and priority management
  getStatusOptions() {
    return [
      { value: 'scheduled', label: 'Scheduled', color: 'blue' },
      { value: 'in_progress', label: 'In Progress', color: 'yellow' },
      { value: 'completed', label: 'Completed', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ]
  }

  getPriorityOptions() {
    return [
      { value: 'low', label: 'Low', color: 'gray' },
      { value: 'medium', label: 'Medium', color: 'blue' },
      { value: 'high', label: 'High', color: 'orange' },
      { value: 'urgent', label: 'Urgent', color: 'red' }
    ]
  }

  getAppointmentTypeOptions() {
    return [
      { value: 'service', label: 'Service' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'inspection', label: 'Inspection' },
      { value: 'consultation', label: 'Consultation' }
    ]
  }
}
