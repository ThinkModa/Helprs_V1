'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type PaymentTransaction = Database['public']['Tables']['payment_transactions']['Row']
export type PaymentTransactionInsert = Database['public']['Tables']['payment_transactions']['Insert']
export type PaymentTransactionUpdate = Database['public']['Tables']['payment_transactions']['Update']

export type CompanyPaymentSettings = Database['public']['Tables']['company_payment_settings']['Row']
export type CompanyPaymentSettingsInsert = Database['public']['Tables']['company_payment_settings']['Insert']
export type CompanyPaymentSettingsUpdate = Database['public']['Tables']['company_payment_settings']['Update']

export type ScheduledAppointment = Database['public']['Tables']['scheduled_appointments']['Row']
export type TimeEntry = Database['public']['Tables']['time_entries']['Row']

export interface PaymentCalculation {
  grossAmount: number
  platformFee: number
  stripeFee: number
  netAmount: number
}

export interface WorkerPaymentAggregation {
  workerId: string
  totalHours: number
  totalAmount: number
  timeEntries: TimeEntry[]
  paymentPreference: 'per_job' | 'weekly' | 'bi_weekly'
}

export class PaymentService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient
  }

  /**
   * Process customer deposit when appointment is booked
   */
  async processDeposit(
    appointmentId: string,
    customerId: string,
    depositAmount: number,
    paymentMethodId: string
  ): Promise<PaymentTransaction> {
    try {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await this.supabase
        .from('scheduled_appointments')
        .select('*, customers(*), companies(*)')
        .eq('id', appointmentId)
        .single()

      if (appointmentError) throw appointmentError

      // Calculate fees
      const calculation = this.calculatePaymentFees(depositAmount, appointment.companies.platform_fee_percentage)

      // Create payment transaction record
      const { data: transaction, error: transactionError } = await this.supabase
        .from('payment_transactions')
        .insert({
          company_id: appointment.company_id,
          customer_id: customerId,
          appointment_id: appointmentId,
          transaction_type: 'customer_payment',
          gross_amount: depositAmount,
          platform_fee: calculation.platformFee,
          stripe_fee: calculation.stripeFee,
          net_amount: calculation.netAmount,
          status: 'pending',
          is_deposit: true,
          description: `Deposit for ${appointment.title}`,
          metadata: {
            payment_method_id: paymentMethodId,
            appointment_title: appointment.title
          }
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Update appointment with deposit status
      await this.supabase
        .from('scheduled_appointments')
        .update({
          deposit_paid: true,
          deposit_transaction_id: transaction.id
        })
        .eq('id', appointmentId)

      // TODO: In production, process actual Stripe payment here
      // For now, simulate successful payment
      await this.updateTransactionStatus(transaction.id, 'succeeded')

      return transaction
    } catch (error) {
      console.error('Error processing deposit:', error)
      throw error
    }
  }

  /**
   * Calculate total job cost based on time entries
   */
  async calculateJobCost(appointmentId: string): Promise<number> {
    try {
      const { data: timeEntries, error } = await this.supabase
        .from('time_entries')
        .select('*')
        .eq('scheduled_appointment_id', appointmentId)
        .eq('payment_status', 'pending')

      if (error) throw error

      const totalCost = timeEntries.reduce((sum, entry) => {
        return sum + (entry.total_amount || 0)
      }, 0)

      return totalCost
    } catch (error) {
      console.error('Error calculating job cost:', error)
      throw error
    }
  }

  /**
   * Request customer approval for final payment
   */
  async requestCustomerApproval(appointmentId: string): Promise<void> {
    try {
      const actualCost = await this.calculateJobCost(appointmentId)

      // Update appointment with actual cost and approval request
      await this.supabase
        .from('scheduled_appointments')
        .update({
          actual_cost: actualCost,
          final_payment_status: 'pending'
        })
        .eq('id', appointmentId)

      // TODO: Send notification to customer (email, SMS, etc.)
      console.log(`Customer approval requested for appointment ${appointmentId}, amount: $${actualCost}`)
    } catch (error) {
      console.error('Error requesting customer approval:', error)
      throw error
    }
  }

  /**
   * Process customer final payment after approval
   */
  async processCustomerPayment(
    appointmentId: string,
    customerId: string,
    paymentMethodId: string
  ): Promise<PaymentTransaction> {
    try {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await this.supabase
        .from('scheduled_appointments')
        .select('*, customers(*), companies(*)')
        .eq('id', appointmentId)
        .single()

      if (appointmentError) throw appointmentError

      if (!appointment.customer_approved_hours) {
        throw new Error('Customer has not approved the final payment')
      }

      const finalAmount = appointment.actual_cost || 0
      const calculation = this.calculatePaymentFees(finalAmount, appointment.companies.platform_fee_percentage)

      // Create payment transaction
      const { data: transaction, error: transactionError } = await this.supabase
        .from('payment_transactions')
        .insert({
          company_id: appointment.company_id,
          customer_id: customerId,
          appointment_id: appointmentId,
          transaction_type: 'customer_payment',
          gross_amount: finalAmount,
          platform_fee: calculation.platformFee,
          stripe_fee: calculation.stripeFee,
          net_amount: calculation.netAmount,
          status: 'pending',
          is_final_payment: true,
          description: `Final payment for ${appointment.title}`,
          metadata: {
            payment_method_id: paymentMethodId,
            appointment_title: appointment.title
          }
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Update appointment
      await this.supabase
        .from('scheduled_appointments')
        .update({
          final_payment_status: 'paid',
          final_payment_transaction_id: transaction.id
        })
        .eq('id', appointmentId)

      // TODO: Process actual Stripe payment
      await this.updateTransactionStatus(transaction.id, 'succeeded')

      return transaction
    } catch (error) {
      console.error('Error processing customer payment:', error)
      throw error
    }
  }

  /**
   * Process worker payout based on their preference
   */
  async processWorkerPayout(
    workerId: string,
    timeEntryId: string,
    amount: number
  ): Promise<PaymentTransaction> {
    try {
      // Get time entry and worker details
      const { data: timeEntry, error: timeEntryError } = await this.supabase
        .from('time_entries')
        .select('*, user_profiles(*), scheduled_appointments(*)')
        .eq('id', timeEntryId)
        .single()

      if (timeEntryError) throw timeEntryError

      const worker = timeEntry.user_profiles
      const appointment = timeEntry.scheduled_appointments

      // Create payment transaction
      const { data: transaction, error: transactionError } = await this.supabase
        .from('payment_transactions')
        .insert({
          company_id: timeEntry.company_id,
          worker_id: workerId,
          appointment_id: appointment.id,
          time_entry_id: timeEntryId,
          transaction_type: 'worker_payout',
          gross_amount: amount,
          platform_fee: 0, // Workers don't pay platform fees
          stripe_fee: this.calculateStripeFee(amount),
          net_amount: amount - this.calculateStripeFee(amount),
          status: 'pending',
          description: `Payment for ${appointment.title}`,
          metadata: {
            worker_name: `${worker.first_name} ${worker.last_name}`,
            hours_worked: timeEntry.hours_worked,
            hourly_rate: timeEntry.hourly_rate_at_time
          }
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Update time entry
      await this.supabase
        .from('time_entries')
        .update({
          payment_status: 'paid',
          payment_transaction_id: transaction.id
        })
        .eq('id', timeEntryId)

      // TODO: Process actual Stripe transfer
      await this.updateTransactionStatus(transaction.id, 'succeeded')

      return transaction
    } catch (error) {
      console.error('Error processing worker payout:', error)
      throw error
    }
  }

  /**
   * Aggregate worker payments for weekly/bi-weekly schedules
   */
  async aggregateWorkerPayments(
    companyId: string,
    workerId: string,
    startDate: string,
    endDate: string
  ): Promise<WorkerPaymentAggregation> {
    try {
      const { data: timeEntries, error } = await this.supabase
        .from('time_entries')
        .select('*, user_profiles(*)')
        .eq('company_id', companyId)
        .eq('worker_id', workerId)
        .eq('payment_status', 'pending')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (error) throw error

      const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0)
      const totalAmount = timeEntries.reduce((sum, entry) => sum + (entry.total_amount || 0), 0)

      return {
        workerId,
        totalHours,
        totalAmount,
        timeEntries,
        paymentPreference: timeEntries[0]?.user_profiles?.payment_preference || 'weekly'
      }
    } catch (error) {
      console.error('Error aggregating worker payments:', error)
      throw error
    }
  }

  /**
   * Get company payment settings
   */
  async getCompanyPaymentSettings(companyId: string): Promise<CompanyPaymentSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('company_payment_settings')
        .select('*')
        .eq('company_id', companyId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - company doesn't have payment settings yet
          return null
        }
        throw error
      }
      return data
    } catch (error) {
      console.warn('No payment settings found for company:', companyId)
      // Return null instead of throwing to allow the component to handle gracefully
      return null
    }
  }

  /**
   * Update company payment settings
   */
  async updateCompanyPaymentSettings(
    companyId: string,
    settings: CompanyPaymentSettingsUpdate
  ): Promise<CompanyPaymentSettings> {
    try {
      const { data, error } = await this.supabase
        .from('company_payment_settings')
        .upsert({
          company_id: companyId,
          ...settings
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating company payment settings:', error)
      throw error
    }
  }

  /**
   * Get payment transactions for a company
   */
  async getPaymentTransactions(
    companyId: string,
    filters?: {
      transactionType?: string
      status?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<PaymentTransaction[]> {
    try {
      let query = this.supabase
        .from('payment_transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (filters?.transactionType) {
        query = query.eq('transaction_type', filters.transactionType)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      const { data, error } = await query

      if (error) {
        // If table doesn't exist or no data, return empty array
        if (error.code === '42P01' || error.code === 'PGRST116') {
          return []
        }
        throw error
      }
      return data || []
    } catch (error) {
      console.warn('Could not load payment transactions:', error)
      // Return empty array instead of throwing to allow graceful handling
      return []
    }
  }

  /**
   * Update transaction status
   */
  private async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
    try {
      await this.supabase
        .from('payment_transactions')
        .update({ status })
        .eq('id', transactionId)
    } catch (error) {
      console.error('Error updating transaction status:', error)
      throw error
    }
  }

  /**
   * Calculate payment fees
   */
  private calculatePaymentFees(amount: number, platformFeePercentage: number): PaymentCalculation {
    const platformFee = (amount * platformFeePercentage) / 100
    const stripeFee = this.calculateStripeFee(amount)
    const netAmount = amount - platformFee - stripeFee

    return {
      grossAmount: amount,
      platformFee,
      stripeFee,
      netAmount
    }
  }

  /**
   * Calculate Stripe fees (2.9% + $0.30)
   */
  private calculateStripeFee(amount: number): number {
    return (amount * 0.029) + 0.30
  }

  /**
   * Get active jobs (appointments with workers currently clocked in)
   */
  async getActiveJobs(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_appointments')
        .select(`
          *,
          customers(*),
          time_entries!inner(*, user_profiles(*))
        `)
        .eq('company_id', companyId)
        .is('time_entries.clock_out_time', null)
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting active jobs:', error)
      throw error
    }
  }

  /**
   * Get completed jobs awaiting payment resolution
   */
  async getCompletedJobsAwaitingPayment(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_appointments')
        .select(`
          *,
          customers(*),
          time_entries(*, user_profiles(*))
        `)
        .eq('company_id', companyId)
        .eq('status', 'completed')
        .neq('final_payment_status', 'paid')
        .order('scheduled_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting completed jobs awaiting payment:', error)
      throw error
    }
  }
}
