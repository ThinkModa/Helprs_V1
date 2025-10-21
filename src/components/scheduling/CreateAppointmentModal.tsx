'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, User, Calendar, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SchedulingService, ScheduledAppointmentWithDetails } from '@/lib/database/scheduling'
import { CustomerService, CustomerWithStats } from '@/lib/database/customers'
import { createClient } from '@/lib/supabase/client'

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onAppointmentCreated: (appointment: ScheduledAppointmentWithDetails) => void
  companyId: string
}

interface FormData {
  // Step 1: Customer Selection/Creation
  customer: CustomerWithStats | null
  newCustomer: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  isNewCustomer: boolean
  
  // Step 2: Services Selection
  selectedServices: string[]
  
  // Step 3: Forms Integration
  selectedForms: string[]
  
  // Step 4: Worker Assignment
  requiredWorkers: number
  selectedWorkers: string[]
  
  // General appointment info
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  duration: number
}

export function CreateAppointmentModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onAppointmentCreated, 
  companyId 
}: CreateAppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [schedulingService] = useState(() => new SchedulingService(createClient()))
  const [customerService] = useState(() => new CustomerService(createClient()))
  
  const [formData, setFormData] = useState<FormData>({
    customer: null,
    newCustomer: {
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    },
    isNewCustomer: false,
    selectedServices: [],
    selectedForms: [],
    requiredWorkers: 1,
    selectedWorkers: [],
    title: '',
    description: '',
    location: '',
    startTime: '09:00',
    endTime: '10:00',
    duration: 60
  })

  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [availableForms, setAvailableForms] = useState<any[]>([])
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([])
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const steps = [
    { id: 1, title: 'Customer', icon: User, description: 'Select or create customer' },
    { id: 2, title: 'Services', icon: Calendar, description: 'Choose services' },
    { id: 3, title: 'Forms', icon: FileText, description: 'Select forms' },
    { id: 4, title: 'Workers', icon: Users, description: 'Assign workers' }
  ]

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, companyId])

  useEffect(() => {
    if (formData.selectedServices.length > 0) {
      loadFormsForServices()
    }
  }, [formData.selectedServices])

  useEffect(() => {
    if (formData.startTime && formData.duration) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(start.getTime() + formData.duration * 60000)
      const endTimeString = end.toTimeString().substring(0, 5)
      setFormData(prev => ({ ...prev, endTime: endTimeString }))
    }
  }, [formData.startTime, formData.duration])

  const loadInitialData = async () => {
    try {
      const [services, customersData] = await Promise.all([
        schedulingService.getServices(companyId),
        customerService.getCustomers(companyId)
      ])
      
      setAvailableServices(services)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadFormsForServices = async () => {
    try {
      const forms = []
      for (const serviceId of formData.selectedServices) {
        const serviceForms = await schedulingService.getFormsByService(serviceId)
        forms.push(...serviceForms)
      }
      setAvailableForms(forms)
    } catch (error) {
      console.error('Error loading forms:', error)
    }
  }

  const loadAvailableWorkers = async () => {
    try {
      const workers = await schedulingService.getAvailableWorkers(
        companyId,
        selectedDate.toISOString().split('T')[0],
        formData.startTime,
        formData.endTime
      )
      setAvailableWorkers(workers)
    } catch (error) {
      console.error('Error loading available workers:', error)
    }
  }

  const handleCustomerSearch = (term: string) => {
    setCustomerSearchTerm(term)
    setShowCustomerDropdown(term.length > 0)
    
    if (term.length > 0) {
      const filteredCustomers = customers.filter(customer =>
        customer.first_name.toLowerCase().includes(term.toLowerCase()) ||
        customer.last_name.toLowerCase().includes(term.toLowerCase()) ||
        customer.email.toLowerCase().includes(term.toLowerCase())
      )
      setCustomers(filteredCustomers)
    }
  }

  const handleCustomerSelect = (customer: CustomerWithStats) => {
    setFormData(prev => ({ ...prev, customer, isNewCustomer: false }))
    setCustomerSearchTerm(`${customer.first_name} ${customer.last_name}`)
    setShowCustomerDropdown(false)
  }

  const handleNewCustomerToggle = () => {
    setFormData(prev => ({ 
      ...prev, 
      isNewCustomer: !prev.isNewCustomer,
      customer: null,
      newCustomer: {
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
      }
    }))
    setCustomerSearchTerm('')
    setShowCustomerDropdown(false)
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }))
  }

  const handleFormToggle = (formId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedForms: prev.selectedForms.includes(formId)
        ? prev.selectedForms.filter(id => id !== formId)
        : [...prev.selectedForms, formId]
    }))
  }

  const handleWorkerToggle = (workerId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedWorkers: prev.selectedWorkers.includes(workerId)
        ? prev.selectedWorkers.filter(id => id !== workerId)
        : [...prev.selectedWorkers, workerId]
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      
      // Load workers when moving to step 4
      if (currentStep === 3) {
        loadAvailableWorkers()
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create customer if new
      let customerId = formData.customer?.id
      if (formData.isNewCustomer) {
        const newCustomer = await customerService.createCustomer({
          company_id: companyId,
          first_name: formData.newCustomer.first_name,
          last_name: formData.newCustomer.last_name,
          email: formData.newCustomer.email,
          phone: formData.newCustomer.phone,
          customer_id: await customerService.generateCustomerId(companyId),
          status: 'active',
          total_jobs: 0,
          total_spent: 0,
          created_by: 'current-user-id'
        })
        customerId = newCustomer.id
      }

      // Create scheduled appointment
      const appointment = await schedulingService.createScheduledAppointment({
        company_id: companyId,
        customer_id: customerId!,
        title: formData.title || `${formData.customer?.first_name || formData.newCustomer.first_name}'s Appointment`,
        description: formData.description,
        scheduled_date: selectedDate.toISOString().split('T')[0],
        start_time: formData.startTime,
        end_time: formData.endTime,
        duration_minutes: formData.duration,
        location: formData.location,
        status: 'scheduled',
        required_workers: formData.requiredWorkers,
        assigned_workers: formData.selectedWorkers.length,
        created_by: 'current-user-id'
      })

      onAppointmentCreated(appointment)
      onClose()
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.isNewCustomer 
          ? (formData.newCustomer.first_name && formData.newCustomer.last_name && formData.newCustomer.email)
          : formData.customer !== null
      case 2:
        return formData.selectedServices.length > 0
      case 3:
        return true // Forms are optional
      case 4:
        return formData.selectedWorkers.length === formData.requiredWorkers
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Appointment</h2>
            <p className="text-gray-600 mt-1">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
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

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                
                <div className="space-y-6">
                  {/* Create New Customer Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Create New Customer</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNewCustomerToggle}
                      >
                        {formData.isNewCustomer ? 'Cancel' : 'Create New Customer'}
                      </Button>
                    </div>

                    {formData.isNewCustomer && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.newCustomer.first_name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newCustomer: { ...prev.newCustomer, first_name: e.target.value }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.newCustomer.last_name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newCustomer: { ...prev.newCustomer, last_name: e.target.value }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.newCustomer.email}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newCustomer: { ...prev.newCustomer, email: e.target.value }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.newCustomer.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newCustomer: { ...prev.newCustomer, phone: e.target.value }
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* Search Existing Customer Section */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Find Existing Customer</h4>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerSearchTerm}
                        onChange={(e) => handleCustomerSearch(e.target.value)}
                        placeholder="Type customer name or email..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {showCustomerDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {customers.map(customer => (
                            <div
                              key={customer.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <div className="font-medium text-gray-900">
                                {customer.first_name} {customer.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableServices.map(service => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.selectedServices.includes(service.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Duration: {service.metadata?.duration || 60} min</span>
                            <span>Cost: ${service.estimated_cost || 0}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.selectedServices.includes(service.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.selectedServices.includes(service.id) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Forms</h3>
                {availableForms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No forms available for selected services
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableForms.map(form => (
                      <div
                        key={form.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.selectedForms.includes(form.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleFormToggle(form.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{form.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.selectedForms.includes(form.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.selectedForms.includes(form.id) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Workers</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Workers Required
                  </label>
                  <select
                    value={formData.requiredWorkers}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requiredWorkers: parseInt(e.target.value),
                      selectedWorkers: [] // Reset selected workers when changing count
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} worker{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Workers ({formData.selectedWorkers.length}/{formData.requiredWorkers} selected)
                  </label>
                  <div className="space-y-3">
                    {availableWorkers.map(worker => (
                      <div
                        key={worker.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.selectedWorkers.includes(worker.id)
                            ? 'border-blue-500 bg-blue-50'
                            : formData.selectedWorkers.length >= formData.requiredWorkers
                            ? 'border-gray-200 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (formData.selectedWorkers.length < formData.requiredWorkers || 
                              formData.selectedWorkers.includes(worker.id)) {
                            handleWorkerToggle(worker.id)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{worker.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">Role: {worker.role}</p>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.selectedWorkers.includes(worker.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.selectedWorkers.includes(worker.id) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {currentStep === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Creating...' : 'Create Appointment'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
