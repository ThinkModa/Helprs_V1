'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AvailabilityCalendarProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
}

interface AvailabilityData {
  date: string
  isAvailable: boolean
  startTime?: string
  endTime?: string
  timeSlots?: string[]
  notes?: string
}

export function AvailabilityCalendar({ isOpen, onClose, userId, userName }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<AvailabilityData[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState({ start: '09:00', end: '17:00' })
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  // Load availability data
  useEffect(() => {
    if (isOpen) {
      loadAvailability()
    }
  }, [isOpen, userId, currentMonth])

  const loadAvailability = async () => {
    setLoading(true)
    try {
      // Mock data - in real app, this would fetch from API
      const mockAvailability: AvailabilityData[] = [
        { date: '2024-01-15', isAvailable: true, timeSlots: ['06:00-10:00', '14:00-18:00'] },
        { date: '2024-01-16', isAvailable: true, timeSlots: ['10:00-14:00', '18:00-22:00'] },
        { date: '2024-01-17', isAvailable: false, timeSlots: [] },
        { date: '2024-01-18', isAvailable: true, timeSlots: ['06:00-10:00', '10:00-14:00'] },
      ]
      setAvailability(mockAvailability)
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return availability.find(a => a.date === dateStr)
  }

  const toggleAvailability = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const existing = availability.find(a => a.date === dateStr)
    
    if (existing) {
      setAvailability(availability.map(a => 
        a.date === dateStr 
          ? { ...a, isAvailable: !a.isAvailable }
          : a
      ))
    } else {
      setAvailability([...availability, { 
        date: dateStr, 
        isAvailable: true,
        startTime: timeRange.start,
        endTime: timeRange.end
      }])
    }
  }

  const updateTimeRange = (date: Date, start: string, end: string) => {
    const dateStr = date.toISOString().split('T')[0]
    setAvailability(availability.map(a => 
      a.date === dateStr 
        ? { ...a, startTime: start, endTime: end }
        : a
    ))
  }

  const saveAvailability = async () => {
    setLoading(true)
    try {
      // Mock save - in real app, this would call API
      console.log('Saving availability:', availability)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onClose()
    } catch (error) {
      console.error('Error saving availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetAvailability = () => {
    setAvailability([])
    setSelectedDate(null)
    setTimeRange({ start: '09:00', end: '17:00' })
    setNotes('')
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const toggleTimeSlot = (date: Date, timeSlot: string, isSelected: boolean) => {
    const dateStr = date.toISOString().split('T')[0]
    const existing = availability.find(a => a.date === dateStr)
    
    if (existing) {
      const currentTimeSlots = existing.timeSlots || []
      const updatedTimeSlots = isSelected 
        ? [...currentTimeSlots, timeSlot]
        : currentTimeSlots.filter(slot => slot !== timeSlot)
      
      setAvailability(availability.map(a => 
        a.date === dateStr 
          ? { ...a, timeSlots: updatedTimeSlots, isAvailable: updatedTimeSlots.length > 0 }
          : a
      ))
    } else {
      setAvailability([...availability, { 
        date: dateStr, 
        isAvailable: isSelected,
        timeSlots: isSelected ? [timeSlot] : []
      }])
    }
  }

  const updateAvailabilityForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const existing = availability.find(a => a.date === dateStr)
    
    if (existing) {
      setAvailability(availability.map(a => 
        a.date === dateStr 
          ? { ...a, notes: notes }
          : a
      ))
    } else {
      setAvailability([...availability, { 
        date: dateStr, 
        isAvailable: false,
        timeSlots: [],
        notes: notes
      }])
    }
  }

  // Week view functions
  const getWeekDates = () => {
    const startOfWeek = new Date(currentMonth)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const toggleWeekAvailability = (date: Date, timeSlot: string) => {
    const dateStr = date.toISOString().split('T')[0]
    const existing = availability.find(a => a.date === dateStr)
    const currentTimeSlots = existing?.timeSlots || []
    const isSelected = currentTimeSlots.includes(timeSlot)
    
    if (existing) {
      const updatedTimeSlots = isSelected 
        ? currentTimeSlots.filter(slot => slot !== timeSlot)
        : [...currentTimeSlots, timeSlot]
      
      setAvailability(availability.map(a => 
        a.date === dateStr 
          ? { ...a, timeSlots: updatedTimeSlots, isAvailable: updatedTimeSlots.length > 0 }
          : a
      ))
    } else {
      setAvailability([...availability, { 
        date: dateStr, 
        isAvailable: true,
        timeSlots: [timeSlot]
      }])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Availability Calendar</h2>
              <p className="text-sm text-gray-600">{userName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'month' ? (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              ← Previous
            </Button>
            <h3 className="text-lg font-medium text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              Next →
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = selectedDate === date.toISOString().split('T')[0]
              const availabilityData = getAvailabilityForDate(date)
              const isAvailable = availabilityData?.isAvailable || false
              
              return (
                <div
                  key={index}
                  className={`
                    p-2 min-h-[60px] border border-gray-200 cursor-pointer transition-colors
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}
                    ${isToday ? 'ring-2 ring-gray-500 bg-gray-100' : ''}
                    ${isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''}
                    ${isAvailable ? 'bg-green-50 border-green-200' : ''}
                  `}
                  onClick={() => {
                    if (isCurrentMonth) {
                      setSelectedDate(date.toISOString().split('T')[0])
                    }
                  }}
                >
                  <div className="text-sm font-medium">{date.getDate()}</div>
                  {availabilityData && (
                    <div className="text-xs mt-1">
                      {isAvailable ? (
                        <div className="text-green-600">
                          <div>✓ Available</div>
                          {availabilityData.timeSlots && availabilityData.timeSlots.length > 0 && (
                            <div className="text-gray-500">
                              {availabilityData.timeSlots.length} slot{availabilityData.timeSlots.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-600">✗ Unavailable</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                {formatDate(new Date(selectedDate + 'T00:00:00'))}
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={getAvailabilityForDate(new Date(selectedDate + 'T00:00:00'))?.isAvailable || false}
                        onChange={(e) => toggleAvailability(new Date(selectedDate + 'T00:00:00'))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Available to work</span>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date(selectedDate + 'T00:00:00')
                        const dateStr = date.toISOString().split('T')[0]
                        const existing = availability.find(a => a.date === dateStr)
                        
                        if (existing) {
                          setAvailability(availability.map(a => 
                            a.date === dateStr 
                              ? { ...a, isAvailable: false, timeSlots: [] }
                              : a
                          ))
                        } else {
                          setAvailability([...availability, { 
                            date: dateStr, 
                            isAvailable: false,
                            timeSlots: []
                          }])
                        }
                      }}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Not Available
                    </Button>
                  </div>
                  
                  {getAvailabilityForDate(new Date(selectedDate + 'T00:00:00'))?.isAvailable && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available Time Slots (4-hour blocks)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '6:00 AM - 10:00 AM', value: '06:00-10:00' },
                      { label: '10:00 AM - 2:00 PM', value: '10:00-14:00' },
                      { label: '2:00 PM - 6:00 PM', value: '14:00-18:00' },
                      { label: '6:00 PM - 10:00 PM', value: '18:00-22:00' }
                    ].map((slot) => {
                      const isSelected = getAvailabilityForDate(new Date(selectedDate))?.timeSlots?.includes(slot.value) || false
                      return (
                        <label key={slot.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleTimeSlot(new Date(selectedDate), slot.value, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-900">{slot.label}</span>
                        </label>
                      )
                    })}
                  </div>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Add notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

              {/* Legend */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                  <span>Not Set</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-500 rounded"></div>
                  <span>Today</span>
                </div>
              </div>
            </>
          ) : (
            /* Week View */
            <div className="space-y-4">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getTime() - 7 * 24 * 60 * 60 * 1000))}
                >
                  ← Previous Week
                </Button>
                <h3 className="text-lg font-medium text-gray-900">
                  {getWeekDates()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {getWeekDates()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getTime() + 7 * 24 * 60 * 60 * 1000))}
                >
                  Next Week →
                </Button>
              </div>

              {/* Week Grid */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                  <div className="p-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                    Time Slots
                  </div>
                  {getWeekDates().map((date, index) => (
                    <div key={index} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                      <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-xs text-gray-500">{date.getDate()}</div>
                    </div>
                  ))}
                </div>

                {/* Time Slot Rows */}
                {[
                  { label: '6:00 AM - 10:00 AM', value: '06:00-10:00' },
                  { label: '10:00 AM - 2:00 PM', value: '10:00-14:00' },
                  { label: '2:00 PM - 6:00 PM', value: '14:00-18:00' },
                  { label: '6:00 PM - 10:00 PM', value: '18:00-22:00' }
                ].map((slot, slotIndex) => (
                  <div key={slotIndex} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                    <div className="p-3 text-sm text-gray-700 border-r border-gray-200 bg-gray-50">
                      {slot.label}
                    </div>
                    {getWeekDates().map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const availabilityData = getAvailabilityForDate(date)
                      const isSelected = availabilityData?.timeSlots?.includes(slot.value) || false
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`p-3 border-r border-gray-200 last:border-r-0 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-green-100 hover:bg-green-200' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleWeekAvailability(date, slot.value)}
                        >
                          <div className={`w-6 h-6 mx-auto rounded border-2 ${
                            isSelected 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Week Legend */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                  <span>Not Available</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 pt-8 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={resetAvailability}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={saveAvailability}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
