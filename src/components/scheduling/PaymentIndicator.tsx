'use client'

import React from 'react'
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface PaymentIndicatorProps {
  depositPaid?: boolean
  finalPaymentStatus?: 'pending' | 'approved' | 'paid' | 'disputed'
  hasCardOnFile?: boolean
  depositAmount?: number
  finalAmount?: number
  className?: string
}

export function PaymentIndicator({
  depositPaid = false,
  finalPaymentStatus = 'pending',
  hasCardOnFile = false,
  depositAmount,
  finalAmount,
  className = ''
}: PaymentIndicatorProps) {
  const getDepositIcon = () => {
    if (depositPaid) {
      return <CheckCircle className="w-3 h-3 text-green-600" />
    }
    return <Clock className="w-3 h-3 text-yellow-600" />
  }

  const getFinalPaymentIcon = () => {
    switch (finalPaymentStatus) {
      case 'paid':
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case 'approved':
        return <CheckCircle className="w-3 h-3 text-blue-600" />
      case 'disputed':
        return <XCircle className="w-3 h-3 text-red-600" />
      case 'pending':
      default:
        return <Clock className="w-3 h-3 text-yellow-600" />
    }
  }

  const getFinalPaymentColor = () => {
    switch (finalPaymentStatus) {
      case 'paid':
        return 'text-green-600'
      case 'approved':
        return 'text-blue-600'
      case 'disputed':
        return 'text-red-600'
      case 'pending':
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Deposit Status */}
      <div className="flex items-center space-x-1" title={`Deposit: ${depositPaid ? 'Paid' : 'Pending'}${depositAmount ? ` ($${depositAmount})` : ''}`}>
        <DollarSign className="w-3 h-3 text-gray-500" />
        {getDepositIcon()}
      </div>

      {/* Final Payment Status */}
      <div className="flex items-center space-x-1" title={`Final Payment: ${finalPaymentStatus}${finalAmount ? ` ($${finalAmount})` : ''}`}>
        <CreditCard className="w-3 h-3 text-gray-500" />
        {getFinalPaymentIcon()}
      </div>

      {/* Card on File Indicator */}
      {hasCardOnFile && (
        <div title="Card on file">
          <CreditCard className="w-3 h-3 text-green-600" />
        </div>
      )}
    </div>
  )
}

// Compact version for calendar cells
export function PaymentIndicatorCompact({
  depositPaid = false,
  finalPaymentStatus = 'pending',
  hasCardOnFile = false,
  className = ''
}: PaymentIndicatorProps) {
  const getStatusColor = () => {
    if (finalPaymentStatus === 'disputed') return 'bg-red-500'
    if (finalPaymentStatus === 'paid') return 'bg-green-500'
    if (finalPaymentStatus === 'approved') return 'bg-blue-500'
    if (depositPaid) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Main status indicator */}
      <div 
        className={`w-2 h-2 rounded-full ${getStatusColor()}`}
        title={`Deposit: ${depositPaid ? 'Paid' : 'Pending'}, Final: ${finalPaymentStatus}${hasCardOnFile ? ', Card on file' : ''}`}
      />
      
      {/* Card on file indicator */}
      {hasCardOnFile && (
        <div title="Card on file">
          <CreditCard className="w-2 h-2 text-green-600" />
        </div>
      )}
    </div>
  )
}

