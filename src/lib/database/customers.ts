'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type CustomerJob = Database['public']['Tables']['customer_jobs']['Row']
export type CustomerJobInsert = Database['public']['Tables']['customer_jobs']['Insert']
export type CustomerJobUpdate = Database['public']['Tables']['customer_jobs']['Update']

// Extended types for UI display
export interface CustomerWithStats extends Customer {
  job_count: number
  total_spent: number
  last_job_date: string | null
  last_job_title: string | null
}

export interface CustomerJobWithDetails extends CustomerJob {
  customer_name: string
  appointment_title: string | null
}

export class CustomerService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient
  }

  // Mock data for demonstration purposes
  private mockCustomers: CustomerWithStats[] = [
    {
      id: 'cust-001',
      company_id: 'master-template',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      customer_id: 'CUST-001',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62701',
      status: 'active',
      last_job_title: 'House Cleaning',
      last_job_date: '2024-01-14',
      total_jobs: 12,
      total_spent: 2400.00,
      notes: 'Prefers morning appointments. Has two cats.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      job_count: 12,
    },
    {
      id: 'cust-002',
      company_id: 'master-template',
      first_name: 'Michael',
      last_name: 'Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      customer_id: 'CUST-002',
      address: '456 Oak Avenue',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62702',
      status: 'active',
      last_job_title: 'Office Cleaning',
      last_job_date: '2024-01-09',
      total_jobs: 8,
      total_spent: 1600.00,
      notes: 'Only available on weekends.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      job_count: 8,
    },
    {
      id: 'cust-003',
      company_id: 'master-template',
      first_name: 'Emily',
      last_name: 'Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '(555) 345-6789',
      customer_id: 'CUST-003',
      address: '789 Pine Street',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62703',
      status: 'inactive',
      last_job_title: 'Deep Cleaning',
      last_job_date: '2023-12-19',
      total_jobs: 3,
      total_spent: 450.00,
      notes: 'Moved to new location.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      job_count: 3,
    },
    {
      id: 'cust-004',
      company_id: 'master-template',
      first_name: 'David',
      last_name: 'Thompson',
      email: 'david.thompson@email.com',
      phone: '(555) 456-7890',
      customer_id: 'CUST-004',
      address: '321 Elm Street',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62704',
      status: 'active',
      last_job_title: 'Window Cleaning',
      last_job_date: '2024-01-07',
      total_jobs: 15,
      total_spent: 3000.00,
      notes: 'Always pays on time.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      job_count: 15,
    },
    {
      id: 'cust-005',
      company_id: 'master-template',
      first_name: 'Lisa',
      last_name: 'Anderson',
      email: 'lisa.anderson@email.com',
      phone: '(555) 567-8901',
      customer_id: 'CUST-005',
      address: '654 Maple Drive',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62705',
      status: 'archived',
      last_job_title: 'Carpet Cleaning',
      last_job_date: '2023-11-29',
      total_jobs: 5,
      total_spent: 750.00,
      notes: 'Moved out of state.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      job_count: 5,
    },
  ]

  private mockCustomerJobs: CustomerJobWithDetails[] = [
    {
      id: 'job-001',
      company_id: 'master-template',
      customer_id: 'cust-001',
      appointment_id: 'apt-001',
      job_title: 'House Cleaning',
      job_date: '2024-01-14',
      job_time: '10:00 AM',
      duration_hours: 3,
      location: '123 Main Street, Springfield, IL',
      amount: 150.00,
      status: 'completed',
      rating: 5,
      review: 'Excellent service, very thorough!',
      notes: 'Deep clean requested',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_name: 'Sarah Johnson',
      appointment_title: 'House Cleaning Service',
    },
    {
      id: 'job-002',
      company_id: 'master-template',
      customer_id: 'cust-001',
      appointment_id: 'apt-002',
      job_title: 'Window Washing',
      job_date: '2024-01-07',
      job_time: '2:00 PM',
      duration_hours: 2,
      location: '123 Main Street, Springfield, IL',
      amount: 120.00,
      status: 'completed',
      rating: 4,
      review: 'Good job, windows look great',
      notes: 'All windows cleaned',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_name: 'Sarah Johnson',
      appointment_title: 'Window Cleaning Service',
    },
    {
      id: 'job-003',
      company_id: 'master-template',
      customer_id: 'cust-001',
      appointment_id: 'apt-003',
      job_title: 'Office Cleaning',
      job_date: '2024-01-21',
      job_time: '9:00 AM',
      duration_hours: 4,
      location: '123 Main Street, Springfield, IL',
      amount: 200.00,
      status: 'pending',
      rating: null,
      review: null,
      notes: 'Weekly cleaning service',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_name: 'Sarah Johnson',
      appointment_title: 'Office Cleaning Service',
    },
  ]

  // Customer CRUD operations
  async getCustomers(companyId: string): Promise<CustomerWithStats[]> {
    // In a real app, this would query the database
    // For now, return mock data filtered by company
    return this.mockCustomers.filter(customer => customer.company_id === companyId)
  }

  async getCustomerById(customerId: string): Promise<CustomerWithStats | null> {
    // In a real app, this would query the database
    return this.mockCustomers.find(customer => customer.id === customerId) || null
  }

  async createCustomer(customerData: CustomerInsert): Promise<CustomerWithStats> {
    // In a real app, this would insert into the database
    const newCustomer: CustomerWithStats = {
      id: `cust-${Math.random().toString(36).substr(2, 9)}`,
      ...customerData,
      total_jobs: 0,
      total_spent: 0,
      last_job_title: null,
      last_job_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user-id',
      updated_by: null,
      job_count: 0,
    }
    
    this.mockCustomers.push(newCustomer)
    return newCustomer
  }

  async updateCustomer(customerId: string, updates: CustomerUpdate): Promise<CustomerWithStats | null> {
    // In a real app, this would update the database
    const index = this.mockCustomers.findIndex(customer => customer.id === customerId)
    if (index === -1) return null

    this.mockCustomers[index] = {
      ...this.mockCustomers[index],
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: 'current-user-id',
    }

    return this.mockCustomers[index]
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    // In a real app, this would delete from the database
    const index = this.mockCustomers.findIndex(customer => customer.id === customerId)
    if (index === -1) return false

    this.mockCustomers.splice(index, 1)
    return true
  }

  // Customer Job operations
  async getCustomerJobs(customerId: string): Promise<CustomerJobWithDetails[]> {
    // In a real app, this would query the database
    return this.mockCustomerJobs.filter(job => job.customer_id === customerId)
  }

  async createCustomerJob(jobData: CustomerJobInsert): Promise<CustomerJobWithDetails> {
    // In a real app, this would insert into the database
    const newJob: CustomerJobWithDetails = {
      id: `job-${Math.random().toString(36).substr(2, 9)}`,
      ...jobData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_name: 'Customer Name', // Would be joined from customers table
      appointment_title: 'Appointment Title', // Would be joined from appointments table
    }
    
    this.mockCustomerJobs.push(newJob)
    return newJob
  }

  async updateCustomerJob(jobId: string, updates: CustomerJobUpdate): Promise<CustomerJobWithDetails | null> {
    // In a real app, this would update the database
    const index = this.mockCustomerJobs.findIndex(job => job.id === jobId)
    if (index === -1) return null

    this.mockCustomerJobs[index] = {
      ...this.mockCustomerJobs[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    return this.mockCustomerJobs[index]
  }

  async deleteCustomerJob(jobId: string): Promise<boolean> {
    // In a real app, this would delete from the database
    const index = this.mockCustomerJobs.findIndex(job => job.id === jobId)
    if (index === -1) return false

    this.mockCustomerJobs.splice(index, 1)
    return true
  }

  // Utility methods
  async generateCustomerId(companyId: string): Promise<string> {
    // In a real app, this would query the database for the next available ID
    const existingCustomers = this.mockCustomers.filter(c => c.company_id === companyId)
    const nextNumber = existingCustomers.length + 1
    return `CUST-${nextNumber.toString().padStart(3, '0')}`
  }

  async searchCustomers(companyId: string, searchTerm: string): Promise<CustomerWithStats[]> {
    // In a real app, this would use database search
    const customers = this.mockCustomers.filter(customer => customer.company_id === companyId)
    
    if (!searchTerm) return customers

    const term = searchTerm.toLowerCase()
    return customers.filter(customer =>
      customer.first_name.toLowerCase().includes(term) ||
      customer.last_name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.customer_id.toLowerCase().includes(term) ||
      (customer.address && customer.address.toLowerCase().includes(term)) ||
      (customer.city && customer.city.toLowerCase().includes(term))
    )
  }

  async getCustomersByStatus(companyId: string, status: 'active' | 'inactive' | 'archived'): Promise<CustomerWithStats[]> {
    // In a real app, this would query the database
    return this.mockCustomers.filter(customer => 
      customer.company_id === companyId && customer.status === status
    )
  }
}

