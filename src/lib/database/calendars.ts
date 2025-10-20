import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/types/database'

export type Calendar = Tables<'calendars'>
export type CalendarInsert = Omit<Calendar, 'id' | 'created_at' | 'updated_at'>
export type CalendarUpdate = Partial<CalendarInsert>

export interface CalendarWithStats extends Calendar {
  appointment_count: number
  active_appointments: number
}

export class CalendarService {
  private supabase: Awaited<ReturnType<typeof createClient>>

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase
  }

  /**
   * Get all calendars for a company
   */
  async getCalendars(companyId: string): Promise<Calendar[]> {
    const { data, error } = await this.supabase
      .from('calendars')
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching calendars:', error)
      throw new Error('Failed to fetch calendars')
    }

    return data || []
  }

  /**
   * Get calendars with appointment statistics
   */
  async getCalendarsWithStats(companyId: string): Promise<CalendarWithStats[]> {
    const { data, error } = await this.supabase
      .from('calendars')
      .select(`
        *,
        appointment_calendars!inner(
          appointment_id,
          appointments!inner(
            id,
            status
          )
        )
      `)
      .eq('company_id', companyId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching calendars with stats:', error)
      throw new Error('Failed to fetch calendars with stats')
    }

    // Transform the data to include stats
    const calendarsWithStats: CalendarWithStats[] = (data || []).map(calendar => {
      const appointments = calendar.appointment_calendars || []
      const appointmentCount = appointments.length
      const activeAppointments = appointments.filter(
        (ac: any) => ac.appointments?.status === 'scheduled' || ac.appointments?.status === 'in_progress'
      ).length

      return {
        ...calendar,
        appointment_count: appointmentCount,
        active_appointments: activeAppointments
      }
    })

    return calendarsWithStats
  }

  /**
   * Get a single calendar by ID
   */
  async getCalendar(calendarId: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase
      .from('calendars')
      .select('*')
      .eq('id', calendarId)
      .single()

    if (error) {
      console.error('Error fetching calendar:', error)
      return null
    }

    return data
  }

  /**
   * Create a new calendar
   */
  async createCalendar(calendar: CalendarInsert): Promise<Calendar> {
    const { data, error } = await this.supabase
      .from('calendars')
      .insert(calendar)
      .select()
      .single()

    if (error) {
      console.error('Error creating calendar:', error)
      throw new Error('Failed to create calendar')
    }

    return data
  }

  /**
   * Update a calendar
   */
  async updateCalendar(calendarId: string, updates: CalendarUpdate): Promise<Calendar> {
    const { data, error } = await this.supabase
      .from('calendars')
      .update(updates)
      .eq('id', calendarId)
      .select()
      .single()

    if (error) {
      console.error('Error updating calendar:', error)
      throw new Error('Failed to update calendar')
    }

    return data
  }

  /**
   * Delete a calendar
   */
  async deleteCalendar(calendarId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calendars')
      .delete()
      .eq('id', calendarId)

    if (error) {
      console.error('Error deleting calendar:', error)
      throw new Error('Failed to delete calendar')
    }
  }

  /**
   * Update calendar sort order
   */
  async updateCalendarOrder(calendarIds: string[]): Promise<void> {
    const updates = calendarIds.map((id, index) => ({
      id,
      sort_order: index
    }))

    for (const update of updates) {
      const { error } = await this.supabase
        .from('calendars')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)

      if (error) {
        console.error('Error updating calendar order:', error)
        throw new Error('Failed to update calendar order')
      }
    }
  }

  /**
   * Get calendar types for dropdown
   */
  getCalendarTypes() {
    return [
      { value: 'team', label: 'Team', description: 'Group of workers with similar skills' },
      { value: 'location', label: 'Location', description: 'Geographic area or specific location' },
      { value: 'service_area', label: 'Service Area', description: 'Type of service provided' },
      { value: 'specialization', label: 'Specialization', description: 'Specific expertise or skill set' }
    ]
  }

  /**
   * Get predefined colors for calendars
   */
  getCalendarColors() {
    return [
      { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
      { value: '#10B981', label: 'Green', class: 'bg-green-500' },
      { value: '#F59E0B', label: 'Yellow', class: 'bg-yellow-500' },
      { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
      { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
      { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
      { value: '#F97316', label: 'Orange', class: 'bg-orange-500' },
      { value: '#84CC16', label: 'Lime', class: 'bg-lime-500' },
      { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
      { value: '#6B7280', label: 'Gray', class: 'bg-gray-500' }
    ]
  }
}
