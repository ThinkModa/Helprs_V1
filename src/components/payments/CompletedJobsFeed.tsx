'use client'

import React, { useState, useEffect } from 'react'
import { Clock, AlertCircle, CheckCircle, RefreshCw, Send, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PaymentService } from '@/lib/database/payments'
import { createClient } from '@/lib/supabase/client'

interface CompletedJobsFeedProps {
  companyId: string
}

interface CompletedJob {
  id: string
  title: string
  scheduled_date: string
  start_time: string
  end_time: string
  estimated_cost: number | null
  actual_cost: number | null
  final_payment_status: 'pending' | 'approved' | 'paid' | 'disputed'
  customer_approved_hours: boolean
  customers: {
    first_name: string
    last_name: string
  }
  time_entries: Array<{
    hours_worked: number
    total_amount: number
    user_profiles: {
      first_name: string
      last_name: string
    }
  }>
}

export function CompletedJobsFeed({ companyId }: CompletedJobsFeedProps) {
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paymentService = new PaymentService(createClient())

  useEffect(() => {
    loadCompletedJobs()
  }, [companyId])

  const loadCompletedJobs = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      const jobs = await paymentService.getCompletedJobsAwaitingPayment(companyId)
      setCompletedJobs(jobs || [])
    } catch (err) {
      console.warn('Could not load completed jobs:', err)
      setCompletedJobs([]) // Set empty array instead of showing error
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const getPaymentStatusBadge = (job: CompletedJob) => {
    if (!job.customer_approved_hours) {
      return { 
        label: 'Awaiting Approval', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      }
    }
    if (job.final_payment_status === 'disputed') {
      return { 
        label: 'Disputed', 
        color: 'bg-red-100 text-red-800', 
        icon: AlertCircle 
      }
    }
    if (job.final_payment_status === 'approved') {
      return { 
        label: 'Processing', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      }
    }
    return { 
      label: 'Pending', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock 
    }
  }

  const calculateTotalHours = (timeEntries: CompletedJob['time_entries']) => {
    return timeEntries.reduce((total, entry) => total + (entry.hours_worked || 0), 0)
  }

  const calculateTotalAmount = (timeEntries: CompletedJob['time_entries']) => {
    return timeEntries.reduce((total, entry) => total + (entry.total_amount || 0), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleRequestApproval = async (jobId: string) => {
    try {
      await paymentService.requestCustomerApproval(jobId)
      await loadCompletedJobs() // Refresh the list
    } catch (err) {
      console.error('Error requesting approval:', err)
      setError('Failed to request customer approval')
    }
  }

  const handleViewDetails = (jobId: string) => {
    // TODO: Open detailed view modal or navigate to appointment details
    console.log('View details for job:', jobId)
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
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          Completed Jobs Awaiting Payment ({completedJobs.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadCompletedJobs}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {completedJobs.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">All Payments Resolved!</h4>
          <p className="text-gray-500">No completed jobs are awaiting payment resolution.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedJobs.map((job) => {
            const statusBadge = getPaymentStatusBadge(job)
            const totalHours = calculateTotalHours(job.time_entries)
            const totalAmount = calculateTotalAmount(job.time_entries)
            const actualCost = job.actual_cost || totalAmount
            const estimatedCost = job.estimated_cost

            return (
              <div key={job.id} className="border border-gray-200 bg-white rounded-lg p-4">
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                      <statusBadge.icon className="h-3 w-3 mr-1" />
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">Total Hours</p>
                    <p className="text-lg font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900">Actual Cost</p>
                    <p className="text-lg font-bold text-green-600">${actualCost.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-purple-900">Workers</p>
                    <p className="text-lg font-bold text-purple-600">{job.time_entries.length}</p>
                  </div>
                </div>

                {estimatedCost && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Estimated:</span> ${estimatedCost.toFixed(2)} • 
                      <span className="font-medium ml-2">Difference:</span> 
                      <span className={actualCost > estimatedCost ? 'text-red-600' : 'text-green-600'}>
                        {actualCost > estimatedCost ? '+' : ''}${(actualCost - estimatedCost).toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {job.time_entries.length} worker{job.time_entries.length !== 1 ? 's' : ''} • 
                    Avg: ${totalHours > 0 ? (totalAmount / totalHours).toFixed(2) : '0.00'}/hr
                  </div>
                  <div className="flex items-center space-x-2">
                    {!job.customer_approved_hours && (
                      <Button
                        size="sm"
                        onClick={() => handleRequestApproval(job.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Request Approval
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(job.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
