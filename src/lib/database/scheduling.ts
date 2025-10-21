'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Service = Database['public']['Tables']['services']['Row']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']

export type ScheduledAppointment = Database['public']['Tables']['scheduled_appointments']['Row']
export type ScheduledAppointmentInsert = Database['public']['Tables']['scheduled_appointments']['Insert']
export type ScheduledAppointmentUpdate = Database['public']['Tables']['scheduled_appointments']['Update']

export type AppointmentService = Database['public']['Tables']['appointment_services']['Row']
export type AppointmentServiceInsert = Database['public']['Tables']['appointment_services']['Insert']
export type AppointmentServiceUpdate = Database['public']['Tables']['appointment_services']['Update']

export type AppointmentWorker = Database['public']['Tables']['appointment_workers']['Row']
export type AppointmentWorkerInsert = Database['public']['Tables']['appointment_workers']['Insert']
export type AppointmentWorkerUpdate = Database['public']['Tables']['appointment_workers']['Update']

export type AppointmentForm = Database['public']['Tables']['appointment_forms']['Row']
export type AppointmentFormInsert = Database['public']['Tables']['appointment_forms']['Insert']
export type AppointmentFormUpdate = Database['public']['Tables']['appointment_forms']['Update']

export type AppointmentNote = Database['public']['Tables']['appointment_notes']['Row']
export type AppointmentNoteInsert = Database['public']['Tables']['appointment_notes']['Insert']
export type AppointmentNoteUpdate = Database['public']['Tables']['appointment_notes']['Update']

// Extended types for UI display
export interface ServiceWithDetails extends Service {
  calendar_names?: string[]
  form_names?: string[]
}

export interface ScheduledAppointmentWithDetails extends ScheduledAppointment {
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  assigned_worker_names?: string[]
  service_names?: string[]
  form_names?: string[]
  notes?: AppointmentNote[]
}

export class SchedulingService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient
  }

  // Mock data for demonstration purposes
  private mockServices: ServiceWithDetails[] = [
    {
      id: 'srv-001',
      company_id: 'master-template',
      title: 'House Cleaning Service',
      description: 'Full house cleaning including kitchen, bathrooms, and living areas',
      appointment_type: 'service',
      status: 'active',
      priority: 'medium',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: 'Customer Location',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62701',
      coordinates: null,
      customer_id: null,
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah.johnson@email.com',
      customer_phone: '(555) 123-4567',
      assigned_worker_id: 'user-001',
      assigned_team_id: 'team-001',
      estimated_cost: 150.00,
      actual_cost: null,
      currency: 'USD',
      metadata: {
        duration: 120,
        is_private: false
      },
      notes: 'Standard house cleaning service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      calendar_names: ['House Cleaning Team', 'Downtown Area'],
      form_names: ['Pre-Cleaning Checklist', 'Customer Satisfaction Form']
    },
    {
      id: 'srv-002',
      company_id: 'master-template',
      title: 'Window Washing',
      description: 'Professional window cleaning for residential and commercial properties',
      appointment_type: 'service',
      status: 'active',
      priority: 'low',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: 'Customer Location',
      address: '456 Oak Avenue',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62702',
      coordinates: null,
      customer_id: null,
      customer_name: 'Michael Chen',
      customer_email: 'michael.chen@email.com',
      customer_phone: '(555) 234-5678',
      assigned_worker_id: 'user-002',
      assigned_team_id: 'team-002',
      estimated_cost: 120.00,
      actual_cost: null,
      currency: 'USD',
      metadata: {
        duration: 60,
        is_private: false
      },
      notes: 'Window cleaning service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      calendar_names: ['Window Cleaning Team', 'North Side'],
      form_names: ['Window Inspection Form']
    },
    {
      id: 'srv-003',
      company_id: 'master-template',
      title: 'Deep Cleaning',
      description: 'Comprehensive deep cleaning including carpets, upholstery, and detailed sanitization',
      appointment_type: 'service',
      status: 'active',
      priority: 'high',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      actual_start: null,
      actual_end: null,
      location_name: 'Customer Location',
      address: '789 Pine Street',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62703',
      coordinates: null,
      customer_id: null,
      customer_name: 'Emily Rodriguez',
      customer_email: 'emily.rodriguez@email.com',
      customer_phone: '(555) 345-6789',
      assigned_worker_id: 'user-003',
      assigned_team_id: 'team-001',
      estimated_cost: 300.00,
      actual_cost: null,
      currency: 'USD',
      metadata: {
        duration: 240,
        is_private: false
      },
      notes: 'Deep cleaning service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      calendar_names: ['Deep Cleaning Team', 'Residential Services'],
      form_names: ['Deep Cleaning Checklist', 'Equipment Inspection Form']
    }
  ]

  private mockScheduledAppointments: ScheduledAppointmentWithDetails[] = [
    {
      id: 'sch-001',
      company_id: 'master-template',
      customer_id: 'cust-001',
      title: 'Sarah\'s House Cleaning',
      description: 'Weekly house cleaning for Sarah Johnson',
      scheduled_date: '2024-01-15',
      start_time: '10:00:00',
      end_time: '12:00:00',
      duration_minutes: 120,
      location: '123 Main Street, Springfield, IL',
      status: 'scheduled',
      required_workers: 2,
      assigned_workers: 2,
      created_by: 'user-master-admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah.johnson@email.com',
      customer_phone: '(555) 123-4567',
      assigned_worker_names: ['John Smith', 'Jane Doe'],
      service_names: ['House Cleaning Service'],
      form_names: ['Pre-Cleaning Checklist', 'Customer Satisfaction Form'],
      notes: []
    },
    {
      id: 'sch-002',
      company_id: 'master-template',
      customer_id: 'cust-002',
      title: 'Michael\'s Window Washing',
      description: 'Monthly window cleaning for office building',
      scheduled_date: '2024-01-16',
      start_time: '14:00:00',
      end_time: '15:00:00',
      duration_minutes: 60,
      location: '456 Oak Avenue, Springfield, IL',
      status: 'confirmed',
      required_workers: 1,
      assigned_workers: 1,
      created_by: 'user-master-admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_name: 'Michael Chen',
      customer_email: 'michael.chen@email.com',
      customer_phone: '(555) 234-5678',
      assigned_worker_names: ['Bob Wilson'],
      service_names: ['Window Washing'],
      form_names: ['Window Inspection Form'],
      notes: []
    }
  ]

  // Service CRUD operations
  async getServices(companyId: string): Promise<ServiceWithDetails[]> {
    // In a real app, this would query the database
    return this.mockServices.filter(service => service.company_id === companyId)
  }

  async getServiceById(serviceId: string): Promise<ServiceWithDetails | null> {
    // In a real app, this would query the database
    return this.mockServices.find(service => service.id === serviceId) || null
  }

  async createService(serviceData: ServiceInsert): Promise<ServiceWithDetails> {
    // In a real app, this would insert into the database
    const newService: ServiceWithDetails = {
      id: `srv-${Math.random().toString(36).substr(2, 9)}`,
      ...serviceData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user-id',
      calendar_names: [],
      form_names: []
    }
    
    this.mockServices.push(newService)
    return newService
  }

  async updateService(serviceId: string, updates: ServiceUpdate): Promise<ServiceWithDetails | null> {
    // In a real app, this would update the database
    const index = this.mockServices.findIndex(service => service.id === serviceId)
    if (index === -1) return null

    this.mockServices[index] = {
      ...this.mockServices[index],
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: 'current-user-id'
    }

    return this.mockServices[index]
  }

  async deleteService(serviceId: string): Promise<boolean> {
    // In a real app, this would delete from the database
    const index = this.mockServices.findIndex(service => service.id === serviceId)
    if (index === -1) return false

    this.mockServices.splice(index, 1)
    return true
  }

  // Scheduled Appointment CRUD operations
  async getScheduledAppointments(companyId: string, startDate?: string, endDate?: string): Promise<ScheduledAppointmentWithDetails[]> {
    // In a real app, this would query the database with date filters
    let appointments = this.mockScheduledAppointments.filter(appointment => appointment.company_id === companyId)
    
    if (startDate && endDate) {
      appointments = appointments.filter(appointment => 
        appointment.scheduled_date >= startDate && appointment.scheduled_date <= endDate
      )
    }
    
    return appointments
  }

  async getScheduledAppointmentById(appointmentId: string): Promise<ScheduledAppointmentWithDetails | null> {
    // In a real app, this would query the database
    return this.mockScheduledAppointments.find(appointment => appointment.id === appointmentId) || null
  }

  async createScheduledAppointment(appointmentData: ScheduledAppointmentInsert): Promise<ScheduledAppointmentWithDetails> {
    // In a real app, this would insert into the database
    const newAppointment: ScheduledAppointmentWithDetails = {
      id: `sch-${Math.random().toString(36).substr(2, 9)}`,
      ...appointmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user-id',
      customer_name: 'Customer Name', // Would be joined from customers table
      customer_email: 'customer@email.com',
      customer_phone: '(555) 000-0000',
      assigned_worker_names: [],
      service_names: [],
      form_names: [],
      notes: []
    }
    
    this.mockScheduledAppointments.push(newAppointment)
    return newAppointment
  }

  async updateScheduledAppointment(appointmentId: string, updates: ScheduledAppointmentUpdate): Promise<ScheduledAppointmentWithDetails | null> {
    // In a real app, this would update the database
    const index = this.mockScheduledAppointments.findIndex(appointment => appointment.id === appointmentId)
    if (index === -1) return null

    this.mockScheduledAppointments[index] = {
      ...this.mockScheduledAppointments[index],
      ...updates,
      updated_at: new Date().toISOString()
    }

    return this.mockScheduledAppointments[index]
  }

  async deleteScheduledAppointment(appointmentId: string): Promise<boolean> {
    // In a real app, this would delete from the database
    const index = this.mockScheduledAppointments.findIndex(appointment => appointment.id === appointmentId)
    if (index === -1) return false

    this.mockScheduledAppointments.splice(index, 1)
    return true
  }

  // Worker availability checking
  async getAvailableWorkers(companyId: string, date: string, startTime: string, endTime: string): Promise<any[]> {
    // In a real app, this would check worker availability against existing appointments
    // For now, return mock available workers
    return [
      { id: 'user-001', name: 'John Smith', role: 'worker' },
      { id: 'user-002', name: 'Jane Doe', role: 'worker' },
      { id: 'user-003', name: 'Bob Wilson', role: 'supervisor' }
    ]
  }

  // Conflict detection
  async checkWorkerConflicts(workerIds: string[], date: string, startTime: string, endTime: string): Promise<{ workerId: string; conflicts: any[] }[]> {
    // In a real app, this would check for scheduling conflicts
    // For now, return empty conflicts
    return workerIds.map(workerId => ({ workerId, conflicts: [] }))
  }

  // Utility methods
  async getServicesByCalendar(calendarId: string): Promise<ServiceWithDetails[]> {
    // In a real app, this would query services linked to a specific calendar
    return this.mockServices.filter(service => 
      service.calendar_names?.includes(calendarId)
    )
  }

  async getFormsByService(serviceId: string): Promise<any[]> {
    // In a real app, this would query forms linked to a specific service
    const service = this.mockServices.find(s => s.id === serviceId)
    return service?.form_names?.map(name => ({ id: `form-${name}`, name })) || []
  }
}
