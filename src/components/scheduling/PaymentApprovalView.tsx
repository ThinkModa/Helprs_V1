'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, DollarSign, User, Calendar, AlertTriangle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PaymentService } from '@/lib/database/payments'
import { TimeTrackingService, TimeEntryWithDetails } from '@/lib/database/time-tracking'
import { createClient } from '@/lib/supabase/client'
import { PaymentIndicator } from './PaymentIndicator'

interface PaymentApprovalViewProps {
  companyId: string
  appointmentId?: string
}

interface AppointmentWithDetails {
  id: string
  title: string
  scheduled_date: string
  start_time: string
  end_time: string
  estimated_cost: number | null
  actual_cost: number | null
  final_payment_status: 'pending' | 'approved' | 'paid' | 'disputed'
  customer_approved_hours: boolean
  customer_approved_at: string | null
  deposit_paid: boolean
  deposit_transaction_id: string | null
  customers: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  time_entries: TimeEntryWithDetails[]
}

export function PaymentApprovalView({ companyId, appointmentId }: PaymentApprovalViewProps) {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  const paymentService = new PaymentService(createClient())
  const timeTrackingService = new TimeTrackingService(createClient())

  useEffect(() => {
    loadAppointments()
  }, [companyId, appointmentId])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      
      let query = supabase
        .from('scheduled_appointments')
        .select(`
          *,
          customers(*),
          time_entries(*, user_profiles(*))
        `)
        .eq('company_id', companyId)
        .in('status', ['completed', 'in_progress'])
        .order('scheduled_date', { ascending: false })

      if (appointmentId) {
        query = query.eq('id', appointmentId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Filter appointments that need payment approval
      const filteredAppointments = data?.filter(appointment => 
        appointment.status === 'completed' && 
        !appointment.customer_approved_hours &&
        appointment.final_payment_status === 'pending'
      ) || []

      setAppointments(filteredAppointments)
    } catch (err) {
      console.error('Error loading appointments:', err)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalCost = (timeEntries: TimeEntryWithDetails[]) => {
    return timeEntries.reduce((total, entry) => total + (entry.total_amount || 0), 0)
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

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  const handleRequestApproval = async (appointmentId: string) => {
    try {
      setProcessing(appointmentId)
      await paymentService.requestCustomerApproval(appointmentId)
      await loadAppointments() // Refresh data
    } catch (err) {
      console.error('Error requesting approval:', err)
      setError('Failed to request customer approval')
    } finally {
      setProcessing(null)
    }
  }

  const handleResendApproval = async (appointmentId: string) => {
    try {
      setProcessing(appointmentId)
      await paymentService.requestCustomerApproval(appointmentId)
      await loadAppointments() // Refresh data
    } catch (err) {
      console.error('Error resending approval:', err)
      setError('Failed to resend approval request')
    } finally {
      setProcessing(null)
    }
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
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Approval</h2>
          <p className="text-gray-600">Manage customer approval for completed jobs</p>
        </div>
        <Button
          variant="outline"
          onClick={loadAppointments}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                ${appointments.reduce((total, apt) => total + calculateTotalCost(apt.time_entries), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(appointments.map(apt => apt.customers.id)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No appointments are waiting for customer approval.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const totalCost = calculateTotalCost(appointment.time_entries)
            const totalHours = appointment.time_entries.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0)
            const estimatedCost = appointment.estimated_cost || 0
            const costDifference = totalCost - estimatedCost

            return (
              <Card key={appointment.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(appointment.scheduled_date)}
                      </span>
                      <span>
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {costDifference > 0 ? `+$${costDifference.toFixed(2)} over estimate` : 
                       costDifference < 0 ? `$${Math.abs(costDifference).toFixed(2)} under estimate` : 
                       'Matches estimate'}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Customer</h4>
                    <PaymentIndicator
                      depositPaid={appointment.deposit_paid}
                      finalPaymentStatus={appointment.final_payment_status}
                      hasCardOnFile={false} // TODO: Get from company payment settings
                      depositAmount={appointment.estimated_cost ? appointment.estimated_cost * 0.2 : undefined}
                      finalAmount={totalCost}
                    />
                  </div>
                  <p className="text-gray-700">
                    {appointment.customers.first_name} {appointment.customers.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{appointment.customers.email}</p>
                </div>

                {/* Time Entries Summary */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Work Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">Total Hours</p>
                      <p className="text-lg font-bold text-blue-600">{formatDuration(totalHours)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900">Workers</p>
                      <p className="text-lg font-bold text-green-600">{appointment.time_entries.length}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-900">Avg Rate</p>
                      <p className="text-lg font-bold text-purple-600">
                        ${totalHours > 0 ? (totalCost / totalHours).toFixed(2) : '0.00'}/hr
                      </p>
                    </div>
                  </div>

                  {/* Individual Time Entries */}
                  <div className="space-y-2">
                    {appointment.time_entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {entry.user_profiles.first_name} {entry.user_profiles.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {entry.user_profiles.employee_id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatDuration(entry.hours_worked || 0)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${entry.hourly_rate_at_time}/hr
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(entry.total_amount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Awaiting Approval
                    </span>
                    {appointment.deposit_paid && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Deposit Paid
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendApproval(appointment.id)}
                      disabled={processing === appointment.id}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {processing === appointment.id ? 'Sending...' : 'Resend Request'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRequestApproval(appointment.id)}
                      disabled={processing === appointment.id}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {processing === appointment.id ? 'Sending...' : 'Send Approval Request'}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
