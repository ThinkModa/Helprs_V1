'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type TimeEntry = Database['public']['Tables']['time_entries']['Row']
export type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert']
export type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update']

export type ScheduledAppointment = Database['public']['Tables']['scheduled_appointments']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export interface TimeEntryWithDetails extends TimeEntry {
  user_profiles: UserProfile
  scheduled_appointments: ScheduledAppointment
}

export interface ActiveTimeEntry extends TimeEntry {
  user_profiles: Pick<UserProfile, 'first_name' | 'last_name' | 'employee_id'>
  scheduled_appointments: Pick<ScheduledAppointment, 'title' | 'scheduled_date' | 'start_time'>
}

export interface TimeTrackingSummary {
  totalHours: number
  totalAmount: number
  activeEntries: number
  completedEntries: number
}

export class TimeTrackingService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient
  }

  /**
   * Record worker clock-in
   */
  async clockIn(
    companyId: string,
    appointmentId: string,
    workerId: string,
    notes?: string
  ): Promise<TimeEntry> {
    try {
      // Check if worker is already clocked in for this appointment
      const { data: existingEntry, error: existingError } = await this.supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', companyId)
        .eq('scheduled_appointment_id', appointmentId)
        .eq('worker_id', workerId)
        .is('clock_out_time', null)
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError
      }

      if (existingEntry) {
        throw new Error('Worker is already clocked in for this appointment')
      }

      // Get worker details to snapshot current rate
      const { data: worker, error: workerError } = await this.supabase
        .from('user_profiles')
        .select('hourly_rate, wage_type')
        .eq('id', workerId)
        .single()

      if (workerError) throw workerError

      // Create time entry
      const { data: timeEntry, error: timeEntryError } = await this.supabase
        .from('time_entries')
        .insert({
          company_id: companyId,
          scheduled_appointment_id: appointmentId,
          worker_id: workerId,
          clock_in_time: new Date().toISOString(),
          hourly_rate_at_time: worker.hourly_rate,
          wage_type_at_time: worker.wage_type,
          notes: notes || null,
          payment_status: 'pending'
        })
        .select()
        .single()

      if (timeEntryError) throw timeEntryError

      return timeEntry
    } catch (error) {
      console.error('Error clocking in worker:', error)
      throw error
    }
  }

  /**
   * Record worker clock-out and calculate payment
   */
  async clockOut(
    companyId: string,
    appointmentId: string,
    workerId: string,
    notes?: string
  ): Promise<TimeEntry> {
    try {
      // Get active time entry
      const { data: timeEntry, error: timeEntryError } = await this.supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', companyId)
        .eq('scheduled_appointment_id', appointmentId)
        .eq('worker_id', workerId)
        .is('clock_out_time', null)
        .single()

      if (timeEntryError) throw timeEntryError

      if (!timeEntry) {
        throw new Error('No active time entry found for this worker')
      }

      const clockOutTime = new Date()
      const clockInTime = new Date(timeEntry.clock_in_time)
      const hoursWorked = Math.round(((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100

      // Calculate total amount based on wage type
      let totalAmount = 0
      if (timeEntry.wage_type_at_time === 'hourly') {
        totalAmount = hoursWorked * (timeEntry.hourly_rate_at_time || 0)
      }
      // For salary workers, amount is 0 (they get fixed amount regardless of hours)

      // Update time entry
      const { data: updatedEntry, error: updateError } = await this.supabase
        .from('time_entries')
        .update({
          clock_out_time: clockOutTime.toISOString(),
          hours_worked: hoursWorked,
          total_amount: totalAmount,
          notes: notes || timeEntry.notes
        })
        .eq('id', timeEntry.id)
        .select()
        .single()

      if (updateError) throw updateError

      return updatedEntry
    } catch (error) {
      console.error('Error clocking out worker:', error)
      throw error
    }
  }

  /**
   * Get active time entries (workers currently clocked in)
   */
  async getActiveTimeEntries(companyId: string): Promise<ActiveTimeEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('time_entries')
        .select(`
          *,
          user_profiles!inner(first_name, last_name, employee_id),
          scheduled_appointments!inner(title, scheduled_date, start_time)
        `)
        .eq('company_id', companyId)
        .is('clock_out_time', null)
        .order('clock_in_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting active time entries:', error)
      throw error
    }
  }

  /**
   * Get time entries for a specific appointment
   */
  async getTimeEntriesForAppointment(
    companyId: string,
    appointmentId: string
  ): Promise<TimeEntryWithDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('time_entries')
        .select(`
          *,
          user_profiles!inner(*),
          scheduled_appointments!inner(*)
        `)
        .eq('company_id', companyId)
        .eq('scheduled_appointment_id', appointmentId)
        .order('clock_in_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting time entries for appointment:', error)
      throw error
    }
  }

  /**
   * Get time entries for a specific worker
   */
  async getTimeEntriesForWorker(
    companyId: string,
    workerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeEntryWithDetails[]> {
    try {
      let query = this.supabase
        .from('time_entries')
        .select(`
          *,
          user_profiles!inner(*),
          scheduled_appointments!inner(*)
        `)
        .eq('company_id', companyId)
        .eq('worker_id', workerId)
        .order('clock_in_time', { ascending: false })

      if (startDate) {
        query = query.gte('clock_in_time', startDate)
      }

      if (endDate) {
        query = query.lte('clock_in_time', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting time entries for worker:', error)
      throw error
    }
  }

  /**
   * Calculate appointment total cost based on time entries
   */
  async calculateAppointmentTotal(companyId: string, appointmentId: string): Promise<number> {
    try {
      const { data: timeEntries, error } = await this.supabase
        .from('time_entries')
        .select('total_amount')
        .eq('company_id', companyId)
        .eq('scheduled_appointment_id', appointmentId)
        .not('total_amount', 'is', null)

      if (error) throw error

      const totalCost = timeEntries.reduce((sum, entry) => sum + (entry.total_amount || 0), 0)
      return totalCost
    } catch (error) {
      console.error('Error calculating appointment total:', error)
      throw error
    }
  }

  /**
   * Get time tracking summary for a company
   */
  async getTimeTrackingSummary(
    companyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeTrackingSummary> {
    try {
      let query = this.supabase
        .from('time_entries')
        .select('hours_worked, total_amount, clock_out_time')
        .eq('company_id', companyId)

      if (startDate) {
        query = query.gte('clock_in_time', startDate)
      }

      if (endDate) {
        query = query.lte('clock_in_time', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      const totalHours = data.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0)
      const totalAmount = data.reduce((sum, entry) => sum + (entry.total_amount || 0), 0)
      const activeEntries = data.filter(entry => !entry.clock_out_time).length
      const completedEntries = data.filter(entry => entry.clock_out_time).length

      return {
        totalHours,
        totalAmount,
        activeEntries,
        completedEntries
      }
    } catch (error) {
      console.error('Error getting time tracking summary:', error)
      throw error
    }
  }

  /**
   * Update time entry notes
   */
  async updateTimeEntryNotes(
    companyId: string,
    timeEntryId: string,
    notes: string
  ): Promise<TimeEntry> {
    try {
      const { data, error } = await this.supabase
        .from('time_entries')
        .update({ notes })
        .eq('id', timeEntryId)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating time entry notes:', error)
      throw error
    }
  }

  /**
   * Delete time entry (admin only)
   */
  async deleteTimeEntry(companyId: string, timeEntryId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('time_entries')
        .delete()
        .eq('id', timeEntryId)
        .eq('company_id', companyId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting time entry:', error)
      throw error
    }
  }

  /**
   * Get worker availability for a date range
   */
  async getWorkerAvailability(
    companyId: string,
    workerId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeEntryWithDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('time_entries')
        .select(`
          *,
          user_profiles!inner(*),
          scheduled_appointments!inner(*)
        `)
        .eq('company_id', companyId)
        .eq('worker_id', workerId)
        .gte('clock_in_time', startDate)
        .lte('clock_in_time', endDate)
        .order('clock_in_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting worker availability:', error)
      throw error
    }
  }

  /**
   * Check if worker is available for a time slot
   */
  async isWorkerAvailable(
    companyId: string,
    workerId: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('time_entries')
        .select('clock_in_time, clock_out_time')
        .eq('company_id', companyId)
        .eq('worker_id', workerId)
        .or(`and(clock_in_time.lte.${endTime},clock_out_time.gte.${startTime}),and(clock_in_time.lte.${endTime},clock_out_time.is.null)`)

      if (error) throw error

      // If there are any overlapping time entries, worker is not available
      return data.length === 0
    } catch (error) {
      console.error('Error checking worker availability:', error)
      throw error
    }
  }
}
