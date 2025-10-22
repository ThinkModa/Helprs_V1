'use client'

import React, { useState, useEffect } from 'react'
import { Clock, User, Calendar, DollarSign, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TimeTrackingService, ActiveTimeEntry, TimeEntryWithDetails, TimeTrackingSummary } from '@/lib/database/time-tracking'
import { createClient } from '@/lib/supabase/client'

interface TimeTrackingViewProps {
  companyId: string
  appointmentId?: string
  workerId?: string
}

export function TimeTrackingView({ companyId, appointmentId, workerId }: TimeTrackingViewProps) {
  const [activeEntries, setActiveEntries] = useState<ActiveTimeEntry[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithDetails[]>([])
  const [summary, setSummary] = useState<TimeTrackingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const timeTrackingService = new TimeTrackingService(createClient())

  useEffect(() => {
    loadTimeTrackingData()
  }, [companyId, appointmentId, workerId])

  const loadTimeTrackingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load active time entries
      const active = await timeTrackingService.getActiveTimeEntries(companyId)
      setActiveEntries(active)

      // Load time entries based on filters
      let entries: TimeEntryWithDetails[] = []
      if (appointmentId) {
        entries = await timeTrackingService.getTimeEntriesForAppointment(companyId, appointmentId)
      } else if (workerId) {
        entries = await timeTrackingService.getTimeEntriesForWorker(companyId, workerId)
      } else {
        // Load all time entries for the company (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        entries = await timeTrackingService.getTimeEntriesForWorker(companyId, '', thirtyDaysAgo.toISOString())
      }
      setTimeEntries(entries)

      // Load summary
      const summaryData = await timeTrackingService.getTimeTrackingSummary(companyId)
      setSummary(summaryData)
    } catch (err) {
      console.error('Error loading time tracking data:', err)
      setError('Failed to load time tracking data')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${summary.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Entries</p>
                <p className="text-2xl font-bold text-gray-900">{summary.activeEntries}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{summary.completedEntries}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Active Time Entries */}
      {activeEntries.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Play className="h-5 w-5 text-orange-600 mr-2" />
              Currently Clocked In
            </h3>
            <span className="text-sm text-gray-500">{activeEntries.length} active</span>
          </div>

          <div className="space-y-3">
            {activeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.user_profiles.first_name} {entry.user_profiles.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.user_profiles.employee_id} • {entry.scheduled_appointments.title}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-orange-600">
                    {formatDuration(entry.clock_in_time)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Since {formatTime(entry.clock_in_time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Time Entries History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            Time Entries History
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTimeTrackingData}
          >
            Refresh
          </Button>
        </div>

        {timeEntries.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No time entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {entry.user_profiles.first_name} {entry.user_profiles.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {entry.user_profiles.employee_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.scheduled_appointments.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(entry.scheduled_appointments.scheduled_date)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.clock_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(entry.clock_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.clock_out_time ? formatTime(entry.clock_out_time) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Pause className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.hours_worked ? `${entry.hours_worked}h` : (
                        entry.clock_out_time ? '0h' : formatDuration(entry.clock_in_time)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.hourly_rate_at_time ? `$${entry.hourly_rate_at_time}/hr` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.total_amount ? `$${entry.total_amount.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : entry.payment_status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.payment_status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {entry.payment_status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                        {entry.payment_status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {entry.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
