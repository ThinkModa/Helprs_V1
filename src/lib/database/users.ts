'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type Position = Database['public']['Tables']['positions']['Row']
export type PositionInsert = Database['public']['Tables']['positions']['Insert']
export type PositionUpdate = Database['public']['Tables']['positions']['Update']

export type UserCalendarAssignment = Database['public']['Tables']['user_calendar_assignments']['Row']
export type UserCalendarAssignmentInsert = Database['public']['Tables']['user_calendar_assignments']['Insert']
export type UserCalendarAssignmentUpdate = Database['public']['Tables']['user_calendar_assignments']['Update']

// Extended types for UI display
export interface UserWithDetails extends UserProfile {
  position_name: string | null
  position_color: string | null
  assigned_calendars: Array<{
    id: string
    name: string
    color: string
  }>
  calendar_count: number
}

export interface PositionWithStats extends Position {
  user_count: number
  active_users: number
}

export class UserService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient
  }

  // Mock data for demonstration purposes
  private mockUsers: UserWithDetails[] = [
    {
      id: 'user-001',
      company_id: 'master-template',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      avatar_url: null,
      role: 'general',
      department: 'Operations',
      job_title: 'Crew Member',
      employee_id: 'MT-001',
      mobile_number: '+1 (555) 123-4567',
      start_date: '2024-01-15',
      position_id: 'pos-001',
      status: 'active',
      profile_picture_url: null,
      hire_date: '2024-01-15',
      is_active: true,
      last_login_at: new Date().toISOString(),
      preferences: {},
      metadata: {},
      location_coordinates: null,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      position_name: 'Crew Member',
      position_color: '#F59E0B',
      assigned_calendars: [
        { id: 'cal-001', name: 'House Cleaning Team', color: '#10B981' },
        { id: 'cal-002', name: 'Office Cleaning Team', color: '#3B82F6' }
      ],
      calendar_count: 2
    },
    {
      id: 'user-002',
      company_id: 'master-template',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 234-5678',
      avatar_url: null,
      role: 'manager',
      department: 'Management',
      job_title: 'Team Lead',
      employee_id: 'MT-002',
      mobile_number: '+1 (555) 234-5678',
      start_date: '2024-01-10',
      position_id: 'pos-002',
      status: 'active',
      profile_picture_url: null,
      hire_date: '2024-01-10',
      is_active: true,
      last_login_at: new Date().toISOString(),
      preferences: {},
      metadata: {},
      location_coordinates: null,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      position_name: 'Team Lead',
      position_color: '#10B981',
      assigned_calendars: [
        { id: 'cal-001', name: 'House Cleaning Team', color: '#10B981' },
        { id: 'cal-003', name: 'Downtown Area', color: '#F59E0B' }
      ],
      calendar_count: 2
    },
    {
      id: 'user-003',
      company_id: 'master-template',
      first_name: 'Bob',
      last_name: 'Wilson',
      email: 'bob.wilson@example.com',
      phone: '+1 (555) 345-6789',
      avatar_url: null,
      role: 'supervisor',
      department: 'Operations',
      job_title: 'Site Manager',
      employee_id: 'MT-003',
      mobile_number: '+1 (555) 345-6789',
      start_date: '2024-01-05',
      position_id: 'pos-003',
      status: 'active',
      profile_picture_url: null,
      hire_date: '2024-01-05',
      is_active: true,
      last_login_at: new Date().toISOString(),
      preferences: {},
      metadata: {},
      location_coordinates: null,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      position_name: 'Site Manager',
      position_color: '#3B82F6',
      assigned_calendars: [
        { id: 'cal-002', name: 'Office Cleaning Team', color: '#3B82F6' },
        { id: 'cal-003', name: 'Downtown Area', color: '#F59E0B' },
        { id: 'cal-005', name: 'Residential Services', color: '#8B5CF6' }
      ],
      calendar_count: 3
    },
    {
      id: 'user-004',
      company_id: 'master-template',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 456-7890',
      avatar_url: null,
      role: 'general',
      department: 'Operations',
      job_title: 'Specialist',
      employee_id: 'MT-004',
      mobile_number: '+1 (555) 456-7890',
      start_date: '2024-02-01',
      position_id: 'pos-004',
      status: 'active',
      profile_picture_url: null,
      hire_date: '2024-02-01',
      is_active: true,
      last_login_at: new Date().toISOString(),
      preferences: {},
      metadata: {},
      location_coordinates: null,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      position_name: 'Specialist',
      position_color: '#8B5CF6',
      assigned_calendars: [
        { id: 'cal-006', name: 'Plumbing Team', color: '#06B6D4' }
      ],
      calendar_count: 1
    },
    {
      id: 'user-005',
      company_id: 'master-template',
      first_name: 'Mike',
      last_name: 'Davis',
      email: 'mike.davis@example.com',
      phone: '+1 (555) 567-8901',
      avatar_url: null,
      role: 'general',
      department: 'Operations',
      job_title: 'Crew Member',
      employee_id: 'MT-005',
      mobile_number: '+1 (555) 567-8901',
      start_date: '2024-02-15',
      position_id: 'pos-001',
      status: 'inactive',
      profile_picture_url: null,
      hire_date: '2024-02-15',
      is_active: false,
      last_login_at: new Date(Date.now() - 86400000).toISOString(),
      preferences: {},
      metadata: {},
      location_coordinates: null,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      updated_by: null,
      position_name: 'Crew Member',
      position_color: '#F59E0B',
      assigned_calendars: [
        { id: 'cal-001', name: 'House Cleaning Team', color: '#10B981' }
      ],
      calendar_count: 1
    }
  ]

  private mockPositions: PositionWithStats[] = [
    {
      id: 'pos-001',
      company_id: 'master-template',
      name: 'Crew Member',
      description: 'General team member responsible for service delivery',
      color: '#F59E0B',
      is_active: true,
      sort_order: 1,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      user_count: 2,
      active_users: 1
    },
    {
      id: 'pos-002',
      company_id: 'master-template',
      name: 'Team Lead',
      description: 'Senior team member who leads and coordinates crew activities',
      color: '#10B981',
      is_active: true,
      sort_order: 2,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      user_count: 1,
      active_users: 1
    },
    {
      id: 'pos-003',
      company_id: 'master-template',
      name: 'Site Manager',
      description: 'Manages operations at specific locations or service areas',
      color: '#3B82F6',
      is_active: true,
      sort_order: 3,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      user_count: 1,
      active_users: 1
    },
    {
      id: 'pos-004',
      company_id: 'master-template',
      name: 'Specialist',
      description: 'Expert in specific service areas or equipment',
      color: '#8B5CF6',
      is_active: true,
      sort_order: 4,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin',
      user_count: 1,
      active_users: 1
    }
  ]

  // User Management Methods
  async getUsers(companyId: string): Promise<UserWithDetails[]> {
    // In a real application, you would fetch from Supabase
    // For now, filter mock data by companyId
    return this.mockUsers.filter(user => user.company_id === companyId)
  }

  async getUserById(id: string, companyId: string): Promise<UserWithDetails | null> {
    return this.mockUsers.find(user => user.id === id && user.company_id === companyId) || null
  }

  async createUser(user: UserProfileInsert): Promise<UserWithDetails> {
    const newUser: UserWithDetails = {
      ...user,
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'mock-user-id',
      position_name: null,
      position_color: null,
      assigned_calendars: [],
      calendar_count: 0,
    }
    this.mockUsers.push(newUser)
    return newUser
  }

  async updateUser(id: string, user: UserProfileUpdate): Promise<UserWithDetails | null> {
    const index = this.mockUsers.findIndex(u => u.id === id)
    if (index > -1) {
      this.mockUsers[index] = {
        ...this.mockUsers[index],
        ...user,
        updated_at: new Date().toISOString(),
      }
      return this.mockUsers[index]
    }
    return null
  }

  async deleteUser(id: string): Promise<boolean> {
    const initialLength = this.mockUsers.length
    this.mockUsers = this.mockUsers.filter(u => u.id !== id)
    return this.mockUsers.length < initialLength
  }

  // Position Management Methods
  async getPositions(companyId: string): Promise<PositionWithStats[]> {
    return this.mockPositions.filter(pos => pos.company_id === companyId)
  }

  async getPositionById(id: string, companyId: string): Promise<PositionWithStats | null> {
    return this.mockPositions.find(pos => pos.id === id && pos.company_id === companyId) || null
  }

  async createPosition(position: PositionInsert): Promise<PositionWithStats> {
    const newPosition: PositionWithStats = {
      ...position,
      id: `pos-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'mock-user-id',
      user_count: 0,
      active_users: 0,
    }
    this.mockPositions.push(newPosition)
    return newPosition
  }

  async updatePosition(id: string, position: PositionUpdate): Promise<PositionWithStats | null> {
    const index = this.mockPositions.findIndex(p => p.id === id)
    if (index > -1) {
      this.mockPositions[index] = {
        ...this.mockPositions[index],
        ...position,
        updated_at: new Date().toISOString(),
      }
      return this.mockPositions[index]
    }
    return null
  }

  async deletePosition(id: string): Promise<boolean> {
    const initialLength = this.mockPositions.length
    this.mockPositions = this.mockPositions.filter(p => p.id !== id)
    return this.mockPositions.length < initialLength
  }

  // Calendar Assignment Methods
  async getCalendars(companyId: string) {
    // Mock calendar data for assignment
    return [
      { id: 'cal-001', name: 'House Cleaning Team', color: '#10B981' },
      { id: 'cal-002', name: 'Office Cleaning Team', color: '#3B82F6' },
      { id: 'cal-003', name: 'Downtown Area', color: '#F59E0B' },
      { id: 'cal-004', name: 'North Side', color: '#EF4444' },
      { id: 'cal-005', name: 'Residential Services', color: '#8B5CF6' },
      { id: 'cal-006', name: 'Plumbing Team', color: '#06B6D4' },
    ]
  }

  // Profile Picture Methods
  async updateProfilePicture(userId: string, profilePictureUrl: string) {
    try {
      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePictureUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile picture')
      }

      const result = await response.json()
      return result.user
    } catch (error) {
      console.error('Error updating profile picture:', error)
      throw error
    }
  }

  async removeProfilePicture(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove profile picture')
      }

      const result = await response.json()
      return result.user
    } catch (error) {
      console.error('Error removing profile picture:', error)
      throw error
    }
  }

  async getUserCalendarAssignments(userId: string): Promise<UserCalendarAssignment[]> {
    // Mock implementation - in real app, fetch from database
    return []
  }

  async assignUserToCalendar(userId: string, calendarId: string): Promise<UserCalendarAssignment> {
    // Mock implementation
    return {
      id: `assign-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      calendar_id: calendarId,
      assigned_at: new Date().toISOString(),
      assigned_by: 'mock-user-id',
      is_active: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  async removeUserFromCalendar(userId: string, calendarId: string): Promise<boolean> {
    // Mock implementation
    return true
  }

  // Utility Methods
  async getUsersByRole(companyId: string, role: string): Promise<UserWithDetails[]> {
    return this.mockUsers.filter(user => user.company_id === companyId && user.role === role)
  }

  async getUsersByPosition(companyId: string, positionId: string): Promise<UserWithDetails[]> {
    return this.mockUsers.filter(user => user.company_id === companyId && user.position_id === positionId)
  }

  async getUsersByStatus(companyId: string, status: string): Promise<UserWithDetails[]> {
    return this.mockUsers.filter(user => user.company_id === companyId && user.status === status)
  }

  async searchUsers(companyId: string, searchTerm: string): Promise<UserWithDetails[]> {
    const term = searchTerm.toLowerCase()
    return this.mockUsers.filter(user => 
      user.company_id === companyId && (
        user.first_name.toLowerCase().includes(term) ||
        user.last_name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.employee_id?.toLowerCase().includes(term)
      )
    )
  }
}