'use client'

import React, { useState, useEffect } from 'react'
import { Clock, User, DollarSign, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PaymentService } from '@/lib/database/payments'
import { createClient } from '@/lib/supabase/client'

interface ActiveJobsFeedProps {
  companyId: string
}

interface ActiveJob {
  id: string
  title: string
  scheduled_date: string
  start_time: string
  end_time: string
  customers: {
    first_name: string
    last_name: string
  }
  time_entries: Array<{
    id: string
    clock_in_time: string
    hourly_rate_at_time: number
    user_profiles: {
      first_name: string
      last_name: string
      employee_id: string
    }
  }>
}

export function ActiveJobsFeed({ companyId }: ActiveJobsFeedProps) {
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const paymentService = new PaymentService(createClient())

  // Update current time every second for live elapsed time
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshTimer = setInterval(loadActiveJobs, 30000)
    return () => clearInterval(refreshTimer)
  }, [companyId])

  // Initial load
  useEffect(() => {
    loadActiveJobs()
  }, [companyId])

  const loadActiveJobs = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      const jobs = await paymentService.getActiveJobs(companyId)
      setActiveJobs(jobs || [])
      setLastUpdate(new Date())
    } catch (err) {
      console.warn('Could not load active jobs:', err)
      setActiveJobs([]) // Set empty array instead of showing error
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const calculateElapsedTime = (clockInTime: string) => {
    const elapsed = now - new Date(clockInTime).getTime()
    const hours = Math.floor(elapsed / (1000 * 60 * 60))
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateCurrentCost = (timeEntries: ActiveJob['time_entries']) => {
    return timeEntries.reduce((total, entry) => {
      const elapsed = now - new Date(entry.clock_in_time).getTime()
      const hours = elapsed / (1000 * 60 * 60)
      return total + (hours * (entry.hourly_rate_at_time || 0))
    }, 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 text-orange-600 mr-2" />
          Active Jobs ({activeJobs.length})
        </h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm text-gray-500">
            {isRefreshing && <RefreshCw className="animate-spin h-4 w-4 mr-2" />}
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadActiveJobs}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {activeJobs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Jobs</h4>
          <p className="text-gray-500">No workers are currently clocked in on any appointments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeJobs.map((job) => (
            <div key={job.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">
                    {job.customers.first_name} {job.customers.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(job.scheduled_date)} • {formatTime(job.start_time)} - {formatTime(job.end_time)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">
                    ${calculateCurrentCost(job.time_entries).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Current cost</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Workers clocked in ({job.time_entries.length}):
                </p>
                {job.time_entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.user_profiles.first_name} {entry.user_profiles.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.user_profiles.employee_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">
                        {calculateElapsedTime(entry.clock_in_time)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${entry.hourly_rate_at_time}/hr
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
