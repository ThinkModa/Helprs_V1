'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Filter, 
  Search, 
  ArrowUpDown, 
  Grid3X3, 
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AppointmentForm } from './AppointmentForm'
import { ServiceService, ServiceWithDetails } from '@/lib/database/appointments'
import { createClient } from '@/lib/supabase/client'

interface AppointmentsManagementProps {
  companyId: string
}

export function AppointmentsManagement({ companyId }: AppointmentsManagementProps) {
  console.log('AppointmentsManagement component mounted with companyId:', companyId)
  
  const [appointments, setAppointments] = useState<ServiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'estimated_cost' | 'created_at'>('title')
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<ServiceWithDetails | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card')

  const appointmentService = new ServiceService(createClient())

  useEffect(() => {
    console.log('useEffect triggered for companyId:', companyId)
    loadAppointments()
  }, [companyId])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const services = await appointmentService.getAppointments(companyId)
      console.log('Setting appointments:', services.length, 'items')
      setAppointments(services)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Close dropdown when clicking elsewhere (simplified approach)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // Only close if clicking outside any dropdown
      if (!target.closest('.dropdown-container')) {
        setSelectedAppointment(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (appointment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    return matchesSearch
  })

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title)
    } else if (sortBy === 'estimated_cost') {
      return (a.estimated_cost || 0) - (b.estimated_cost || 0)
    } else if (sortBy === 'created_at') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return 0
  })

  const handleCreateAppointment = () => {
    setEditingAppointment(null)
    setShowForm(true)
  }

  const handleEditAppointment = (appointment: ServiceWithDetails) => {
    console.log('Edit appointment clicked:', appointment.title)
    setEditingAppointment(appointment)
    setShowForm(true)
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      setAppointments(appointments.filter(a => a.id !== appointmentId))
    }
  }

  const handleFormSubmit = (appointmentData: any) => {
    if (editingAppointment) {
      // Update existing appointment
      setAppointments(appointments.map(a => 
        a.id === editingAppointment.id 
          ? { ...a, ...appointmentData, updated_at: new Date().toISOString() }
          : a
      ))
    } else {
      // Create new appointment
      const newAppointment: ServiceWithDetails = {
        ...appointmentData,
        id: `apt-${Math.random().toString(36).substr(2, 9)}`,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'mock-user-id',
        assigned_worker_name: null,
        assigned_team_name: null,
        calendar_names: [],
        form_names: []
      }
      setAppointments([...appointments, newAppointment])
    }
    setShowForm(false)
    setEditingAppointment(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  if (showForm) {
    console.log('Rendering AppointmentForm, editingAppointment:', editingAppointment?.title || 'new')
    return (
      <AppointmentForm
        appointment={editingAppointment}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false)
          setEditingAppointment(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-600">Manage services that can be assigned to calendars</p>
        </div>
        <Button 
          onClick={handleCreateAppointment}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Service
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="title">Sort by Title</option>
            <option value="estimated_cost">Sort by Price</option>
            <option value="created_at">Sort by Created Date</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {sortedAppointments.length} of {appointments.length} services
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="flex items-center space-x-1"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards</span>
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center space-x-1"
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Grid</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {sortedAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Get started by creating your first service'
            }
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateAppointment} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAppointments.map((appointment) => {
            const startTime = formatDateTime(appointment.scheduled_start)
            const endTime = formatDateTime(appointment.scheduled_end)
            
            return (
              <Card key={appointment.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {appointment.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.metadata?.is_private 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {appointment.metadata?.is_private ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        console.log('Three-dot menu clicked for:', appointment.title)
                        setSelectedAppointment(
                          selectedAppointment === appointment.id ? null : appointment.id
                        )
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                    {selectedAppointment === appointment.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                        {console.log('Dropdown rendered for:', appointment.title)}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Edit button clicked for:', appointment.title)
                            setSelectedAppointment(null)
                            handleEditAppointment(appointment)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteAppointment(appointment.id)
                            setSelectedAppointment(null)
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

                <div className="space-y-3">
                  {/* Duration */}
                  {appointment.metadata?.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{appointment.metadata.duration}</span>
                    </div>
                  )}

                  {/* Pricing Type */}
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="capitalize">{appointment.metadata?.pricing_type || 'fixed'} pricing</span>
                  </div>

                  {/* Cost */}
                  {appointment.estimated_cost && (
                    <div className="text-sm font-medium text-gray-900">
                      ${appointment.estimated_cost.toFixed(2)} {appointment.currency}
                      {appointment.metadata?.pricing_type === 'hourly' && '/hour'}
                    </div>
                  )}

                  {/* Calendar Assignments */}
                  {appointment.calendar_names && appointment.calendar_names.length > 0 && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Assigned to:</div>
                        <div className="space-y-1">
                          {appointment.calendar_names.map((calendarName, index) => (
                            <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                              {calendarName}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        // Grid View
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAppointments.map((appointment) => {
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.metadata?.duration || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.metadata?.is_private 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {appointment.metadata?.is_private ? 'Private' : 'Public'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.estimated_cost ? (
                          <div>
                            <div>${appointment.estimated_cost.toFixed(2)} {appointment.currency}</div>
                            {appointment.metadata?.pricing_type === 'hourly' && (
                              <div className="text-xs text-gray-500">per hour</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative dropdown-container">
                          <button
                            onClick={() => {
                              console.log('Grid three-dot menu clicked for:', appointment.title)
                              setSelectedAppointment(
                                selectedAppointment === appointment.id ? null : appointment.id
                              )
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                          {selectedAppointment === appointment.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              {console.log('Grid dropdown rendered for:', appointment.title)}
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log('Edit button clicked for:', appointment.title)
                                  setSelectedAppointment(null)
                                  handleEditAppointment(appointment)
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteAppointment(appointment.id)
                                  setSelectedAppointment(null)
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
