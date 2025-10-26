'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SchedulingService, ScheduledAppointmentWithDetails } from '@/lib/database/scheduling'
import { PaymentService } from '@/lib/database/payments'
import { createClient } from '@/lib/supabase/client'
import { CreateAppointmentModal } from './CreateAppointmentModal'
import { PaymentIndicatorCompact } from './PaymentIndicator'

interface CalendarViewProps {
  companyId: string
}

type ViewMode = 'month' | 'week' | 'day'

export function CalendarView({ companyId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<ScheduledAppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [hasCardOnFile, setHasCardOnFile] = useState(false)
  const [schedulingService] = useState(() => new SchedulingService(createClient()))
  const [paymentService] = useState(() => new PaymentService(createClient()))

  useEffect(() => {
    loadAppointments()
    loadPaymentSettings()
  }, [companyId, currentDate, viewMode])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const startDate = getStartDate()
      const endDate = getEndDate()
      
      const appointmentsData = await schedulingService.getScheduledAppointments(
        companyId,
        startDate,
        endDate
      )
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentSettings = async () => {
    try {
      const paymentSettings = await paymentService.getCompanyPaymentSettings(companyId)
      setHasCardOnFile(!!paymentSettings?.stripe_customer_id)
    } catch (error) {
      console.error('Error loading payment settings:', error)
      setHasCardOnFile(false)
    }
  }

  const getStartDate = () => {
    const date = new Date(currentDate)
    switch (viewMode) {
      case 'month':
        date.setDate(1)
        return date.toISOString().split('T')[0]
      case 'week':
        const dayOfWeek = date.getDay()
        date.setDate(date.getDate() - dayOfWeek)
        return date.toISOString().split('T')[0]
      case 'day':
        return date.toISOString().split('T')[0]
      default:
        return date.toISOString().split('T')[0]
    }
  }

  const getEndDate = () => {
    const date = new Date(currentDate)
    switch (viewMode) {
      case 'month':
        date.setMonth(date.getMonth() + 1, 0)
        return date.toISOString().split('T')[0]
      case 'week':
        const dayOfWeek = date.getDay()
        date.setDate(date.getDate() - dayOfWeek + 6)
        return date.toISOString().split('T')[0]
      case 'day':
        return date.toISOString().split('T')[0]
      default:
        return date.toISOString().split('T')[0]
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleAppointmentCreated = (appointment: ScheduledAppointmentWithDetails) => {
    setAppointments(prev => [...prev, appointment])
    setShowCreateModal(false)
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(appointment => appointment.scheduled_date === dateStr)
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDay = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day)
          const isCurrentMonth = day.getMonth() === month
          const isToday = day.toDateString() === new Date().toDateString()
          const isSelected = selectedDate?.toDateString() === day.toDateString()
          
          return (
            <div
              key={index}
              className={`bg-white p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </span>
                {dayAppointments.length > 0 && (
                  <div className="flex space-x-1">
                    {dayAppointments.slice(0, 3).map((appointment, idx) => (
                      <div
                        key={idx}
                        className="w-2 h-2 rounded-full bg-blue-500"
                        title={appointment.title}
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <span className="text-xs text-gray-500">+{dayAppointments.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Appointments */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map(appointment => (
                  <div
                    key={appointment.id}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                    title={`${appointment.title} - ${formatTime(appointment.start_time)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        {formatTime(appointment.start_time)} {appointment.title}
                      </span>
                      <PaymentIndicatorCompact
                        depositPaid={appointment.deposit_paid}
                        finalPaymentStatus={appointment.final_payment_status}
                        hasCardOnFile={hasCardOnFile}
                        className="ml-1 flex-shrink-0"
                      />
                    </div>
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    const dayOfWeek = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Header */}
        {days.map((day, index) => (
          <div key={index} className="bg-gray-50 p-3 text-center">
            <div className="text-sm font-medium text-gray-700">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-bold ${day.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-900'}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
        
        {/* Time slots */}
        <div className="col-span-7 bg-white p-4">
          <div className="space-y-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const timeString = `${hour.toString().padStart(2, '0')}:00`
              const dayAppointments = days.map(day => getAppointmentsForDate(day))
              
              return (
                <div key={hour} className="flex">
                  <div className="w-16 text-sm text-gray-500 pr-2">
                    {formatTime(timeString)}
                  </div>
                  <div className="flex-1 grid grid-cols-7 gap-px">
                    {days.map((day, dayIndex) => {
                      const appointments = dayAppointments[dayIndex].filter(apt => 
                        apt.start_time.startsWith(timeString.substring(0, 2))
                      )
                      
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[40px] border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedDate(day)}
                        >
                          {appointments.map(appointment => (
                            <div
                              key={appointment.id}
                              className="text-xs p-1 bg-blue-100 text-blue-800 rounded m-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{appointment.title}</span>
                                <PaymentIndicatorCompact
                                  depositPaid={appointment.deposit_paid}
                                  finalPaymentStatus={appointment.final_payment_status}
                                  hasCardOnFile={hasCardOnFile}
                                  className="ml-1 flex-shrink-0"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    
    return (
      <div className="bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {dayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No appointments scheduled for this day
              </div>
            ) : (
              dayAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{appointment.assigned_workers}/{appointment.required_workers} workers</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{appointment.customer_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <PaymentIndicatorCompact
                        depositPaid={appointment.deposit_paid}
                        finalPaymentStatus={appointment.final_payment_status}
                        hasCardOnFile={hasCardOnFile}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (viewMode) {
      case 'month':
        return renderMonthView()
      case 'week':
        return renderWeekView()
      case 'day':
        return renderDayView()
      default:
        return renderMonthView()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
          </div>
          {/* Payment Legend */}
          <div className="flex items-center space-x-4 text-xs text-gray-600 ml-4 pl-4 border-l border-gray-300">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Paid</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Disputed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Approved</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {selectedDate && (
            <Button
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add Appointment</span>
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>

      {/* Create Appointment Modal */}
      {selectedDate && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          selectedDate={selectedDate}
          onAppointmentCreated={handleAppointmentCreated}
          companyId={companyId}
        />
      )}
    </div>
  )
}
