'use client'

import React, { useState } from 'react'
import { X, User, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomerService } from '@/lib/database/customers'
import { createClient } from '@/lib/supabase/client'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  customer_id: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  status: 'active' | 'inactive' | 'archived'
  last_job_title: string | null
  last_job_date: string | null
  total_jobs: number
  total_spent: number
  avatar_url: string | null
  notes: string | null
}

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerCreated: (customer: Customer) => void
  companyId: string
}

export function AddCustomerModal({ isOpen, onClose, onCustomerCreated, companyId }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [customerService] = useState(() => new CustomerService(createClient()))

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate customer ID using the service
      const customerId = await customerService.generateCustomerId(companyId)
      
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        customer_id: customerId,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        status: 'active',
        last_job_title: null,
        last_job_date: null,
        total_jobs: 0,
        total_spent: 0,
        notes: formData.notes || null,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user-id',
        updated_by: null,
        job_count: 0,
      }

      onCustomerCreated(newCustomer)
      onClose()
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating customer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Customer</h2>
            <p className="text-gray-600 mt-1">Create a new customer profile</p>
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

        {/* Form */}
        <form id="add-customer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <Input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state"
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <Input
                type="text"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                placeholder="Enter zip code"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

        </form>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 flex items-center justify-end space-x-3 py-3 px-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-customer-form"
            disabled={loading || !formData.first_name || !formData.last_name || !formData.email}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Creating...' : 'Save Customer'}
          </Button>
        </div>
      </div>
    </div>
  )
}
