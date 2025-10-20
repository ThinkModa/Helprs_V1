'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MoreHorizontal, Users, MapPin, Wrench, Star, Calendar, Filter, Search, ArrowUpDown, Grid3X3, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CalendarForm } from './CalendarForm'
import { CalendarService, CalendarWithStats } from '@/lib/database/calendars'

interface CalendarsManagementProps {
  companyId: string
}

export function CalendarsManagement({ companyId }: CalendarsManagementProps) {
  console.log('CalendarsManagement component mounted with companyId:', companyId)
  
  const [calendars, setCalendars] = useState<CalendarWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'appointments'>('name')
  const [showForm, setShowForm] = useState(false)
  const [editingCalendar, setEditingCalendar] = useState<CalendarWithStats | null>(null)
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card')

  const calendarService = new CalendarService(null as any) // Will be properly initialized with Supabase client

  // Mock data for demonstration
  const mockCalendars: CalendarWithStats[] = [
    {
      id: '1',
      company_id: companyId,
      name: 'House Cleaning Team',
      description: 'Team responsible for residential cleaning services',
      color: '#10B981',
      calendar_type: 'team',
      is_active: true,
      sort_order: 1,
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: null,
      appointment_count: 12,
      active_appointments: 8
    },
    {
      id: '2',
      company_id: companyId,
      name: 'Office Cleaning Team',
      description: 'Team responsible for commercial cleaning services',
      color: '#3B82F6',
      calendar_type: 'team',
      is_active: true,
      sort_order: 2,
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: null,
      appointment_count: 8,
      active_appointments: 5
    },
    {
      id: '3',
      company_id: companyId,
      name: 'Downtown Area',
      description: 'All work in the downtown district',
      color: '#F59E0B',
      calendar_type: 'location',
      is_active: true,
      sort_order: 3,
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: null,
      appointment_count: 15,
      active_appointments: 10
    },
    {
      id: '4',
      company_id: companyId,
      name: 'North Side',
      description: 'All work in the northern part of the city',
      color: '#EF4444',
      calendar_type: 'location',
      is_active: true,
      sort_order: 4,
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: null,
      appointment_count: 6,
      active_appointments: 4
    },
    {
      id: '5',
      company_id: companyId,
      name: 'Plumbing Team',
      description: 'Specialized plumbing services',
      color: '#8B5CF6',
      calendar_type: 'specialization',
      is_active: true,
      sort_order: 5,
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: null,
      appointment_count: 4,
      active_appointments: 2
    }
  ]

  useEffect(() => {
    console.log('useEffect triggered for companyId:', companyId)
    // Simulate loading
    setTimeout(() => {
      console.log('Setting calendars:', mockCalendars.length, 'items')
      setCalendars(mockCalendars)
      setLoading(false)
    }, 1000)
  }, [companyId])

  // Close dropdown when clicking elsewhere (simplified approach)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // Only close if clicking outside any dropdown
      if (!target.closest('.dropdown-container')) {
        setSelectedCalendar(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const getCalendarTypeIcon = (type: string) => {
    switch (type) {
      case 'team':
        return <Users className="w-4 h-4" />
      case 'location':
        return <MapPin className="w-4 h-4" />
      case 'service_area':
        return <Wrench className="w-4 h-4" />
      case 'specialization':
        return <Star className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getCalendarTypeLabel = (type: string) => {
    switch (type) {
      case 'team':
        return 'Team'
      case 'location':
        return 'Location'
      case 'service_area':
        return 'Service Area'
      case 'specialization':
        return 'Specialization'
      default:
        return 'Calendar'
    }
  }

  const filteredCalendars = calendars.filter(calendar => {
    const matchesSearch = calendar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calendar.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || calendar.calendar_type === filterType
    return matchesSearch && matchesFilter
  })

  const sortedCalendars = [...filteredCalendars].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'type':
        return a.calendar_type.localeCompare(b.calendar_type)
      case 'appointments':
        return b.appointment_count - a.appointment_count
      default:
        return 0
    }
  })

  const handleCreateCalendar = () => {
    setEditingCalendar(null)
    setShowForm(true)
  }

  const handleEditCalendar = (calendar: CalendarWithStats) => {
    console.log('Edit calendar clicked:', calendar.name)
    console.log('Current showForm state:', showForm)
    setEditingCalendar(calendar)
    setShowForm(true)
    console.log('Set showForm to true')
  }

  const handleDeleteCalendar = (calendarId: string) => {
    if (confirm('Are you sure you want to delete this calendar? This action cannot be undone.')) {
      setCalendars(calendars.filter(c => c.id !== calendarId))
    }
  }

  const handleFormSubmit = (calendarData: any) => {
    if (editingCalendar) {
      // Update existing calendar
      setCalendars(calendars.map(c => 
        c.id === editingCalendar.id 
          ? { ...c, ...calendarData, updated_at: new Date().toISOString() }
          : c
      ))
    } else {
      // Create new calendar
      const newCalendar: CalendarWithStats = {
        id: Date.now().toString(),
        company_id: companyId,
        ...calendarData,
        appointment_count: 0,
        active_appointments: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null
      }
      setCalendars([...calendars, newCalendar])
    }
    setShowForm(false)
    setEditingCalendar(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendars...</p>
        </div>
      </div>
    )
  }

  if (showForm) {
    console.log('Rendering CalendarForm, editingCalendar:', editingCalendar?.name || 'new')
    return (
      <CalendarForm
        calendar={editingCalendar}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false)
          setEditingCalendar(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendars</h2>
          <p className="text-gray-600">Organize your teams, locations, and service areas</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'card' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleCreateCalendar} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Calendar
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search calendars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="team">Teams</option>
            <option value="location">Locations</option>
            <option value="service_area">Service Areas</option>
            <option value="specialization">Specializations</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="appointments">Sort by Appointments</option>
          </select>
        </div>
      </div>

      {/* Calendars Display */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCalendars.map((calendar) => (
            <Card key={calendar.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: calendar.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{calendar.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      {getCalendarTypeIcon(calendar.calendar_type)}
                      <span>{getCalendarTypeLabel(calendar.calendar_type)}</span>
                    </div>
                  </div>
                </div>
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      console.log('Three-dot menu clicked for:', calendar.name)
                      setSelectedCalendar(
                        selectedCalendar === calendar.id ? null : calendar.id
                      )
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                  {selectedCalendar === calendar.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                      {console.log('Dropdown rendered for:', calendar.name)}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Edit button clicked for:', calendar.name)
                          setSelectedCalendar(null)
                          handleEditCalendar(calendar)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteCalendar(calendar.id)
                          setSelectedCalendar(null)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {calendar.description && (
                <p className="text-gray-600 text-sm mb-4">{calendar.description}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{calendar.appointment_count} total</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">{calendar.active_appointments} active</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  calendar.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {calendar.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calendar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCalendars.map((calendar) => (
                  <tr key={calendar.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: calendar.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{calendar.name}</div>
                          {calendar.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {calendar.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {getCalendarTypeIcon(calendar.calendar_type)}
                        <span className="ml-2">{getCalendarTypeLabel(calendar.calendar_type)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-4">
                          <span>{calendar.appointment_count} total</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">{calendar.active_appointments} active</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        calendar.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {calendar.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => {
                            console.log('Grid three-dot menu clicked for:', calendar.name)
                            setSelectedCalendar(
                              selectedCalendar === calendar.id ? null : calendar.id
                            )
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                        {selectedCalendar === calendar.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                            {console.log('Grid dropdown rendered for:', calendar.name)}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('Edit button clicked for:', calendar.name)
                                setSelectedCalendar(null)
                                handleEditCalendar(calendar)
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteCalendar(calendar.id)
                                setSelectedCalendar(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedCalendars.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No calendars found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first calendar'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <Button onClick={handleCreateCalendar} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Calendar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
