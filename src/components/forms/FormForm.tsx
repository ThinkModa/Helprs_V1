'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, X, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface FormField {
  id: string
  type: 'short_text' | 'long_text' | 'radio' | 'dropdown' | 'multiple_choice' | 'yes_no'
  label: string
  required: boolean
  options?: string[]
  order: number
}

interface Form {
  id: string
  company_id: string
  name: string
  description: string | null
  is_active: boolean
  field_count: number
  created_at: string
  updated_at: string
  created_by: string | null
}

interface FormFormProps {
  form?: Form | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function FormForm({ form, onSubmit, onCancel }: FormFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    is_private: false,
    selected_appointments: [] as string[]
  })
  const [fields, setFields] = useState<FormField[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock appointments for selector (mirror style used elsewhere)
  const appointmentOptions = [
    { value: 'apt-001', label: 'House Cleaning Service' },
    { value: 'apt-002', label: 'Office Deep Cleaning' },
    { value: 'apt-003', label: 'Plumbing Repair Service' },
    { value: 'apt-004', label: 'Carpet Cleaning Service' },
    { value: 'apt-005', label: 'Window Cleaning Service' }
  ]

  const fieldTypes = [
    { value: 'short_text', label: 'Short Text', description: 'Single line text input' },
    { value: 'long_text', label: 'Long Text', description: 'Multi-line text area' },
    { value: 'radio', label: 'Radio Buttons', description: 'Single choice from options' },
    { value: 'dropdown', label: 'Dropdown', description: 'Single choice from dropdown' },
    { value: 'multiple_choice', label: 'Multiple Choice', description: 'Multiple selections allowed' },
    { value: 'yes_no', label: 'Yes/No Toggle', description: 'Simple true/false choice' }
  ]

  useEffect(() => {
    if (form) {
      setFormData({
        name: form.name,
        description: form.description || '',
        is_active: form.is_active,
        is_private: false,
        selected_appointments: []
      })
      // In a real app, you would load the fields from the database
      setFields([])
    }
  }, [form])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Form name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Form description is required'
    }

    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required'
    }

    // Validate each field
    fields.forEach((field, index) => {
      if (!field.label.trim()) {
        newErrors[`field_${index}_label`] = 'Field label is required'
      }
      
      if ((field.type === 'radio' || field.type === 'dropdown' || field.type === 'multiple_choice') && 
          (!field.options || field.options.length === 0)) {
        newErrors[`field_${index}_options`] = 'Options are required for this field type'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        field_count: fields.length,
        fields: fields
      }
      onSubmit(submitData)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'short_text',
      label: '',
      required: false,
      options: [],
      order: fields.length
    }
    setFields([...fields, newField])
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
  }

  const addOption = (fieldId: string) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { ...field, options: [...(field.options || []), ''] }
        : field
    ))
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { 
            ...field, 
            options: field.options?.map((opt, idx) => idx === optionIndex ? value : opt) || []
          }
        : field
    ))
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFields(fields.map(field => 
      field.id === fieldId 
        ? { 
            ...field, 
            options: field.options?.filter((_, idx) => idx !== optionIndex) || []
          }
        : field
    ))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {form ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 mt-1">
            {form ? 'Update form details and fields' : 'Create a custom form for data collection'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Details */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Form Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Form Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., House Cleaning Checklist"
                  className={errors.name ? 'border-red-300 focus:ring-red-500' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this form is used for..."
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300 focus:ring-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Active</div>
                <div className="text-sm text-gray-600">
                  This form is available for use
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  formData.is_active ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    formData.is_active ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>
            </div>

            {/* Access Level */}
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  {formData.is_private ? 'Private (Internal Only)' : 'Public (External & Internal)'}
                </div>
                <div className="text-sm text-gray-600">
                  {formData.is_private
                    ? 'Only internal team members can see this form'
                    : 'Both external clients and internal team can see this form'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_private}
                  onChange={(e) => handleInputChange('is_private', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  formData.is_private ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    formData.is_private ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Appointment Assignment */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Appointment Assignment</h3>
            <p className="text-sm text-gray-600">Choose which appointments this form is used for</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {appointmentOptions.map((apt) => (
                <label
                  key={apt.value}
                  className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.selected_appointments.includes(apt.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.selected_appointments.includes(apt.value)}
                    onChange={() => {
                      const exists = formData.selected_appointments.includes(apt.value)
                      handleInputChange(
                        'selected_appointments',
                        exists
                          ? formData.selected_appointments.filter(id => id !== apt.value)
                          : [...formData.selected_appointments, apt.value]
                      )
                    }}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{apt.label}</div>
                  </div>
                  {formData.selected_appointments.includes(apt.value) && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Form Fields */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
              <Button
                type="button"
                onClick={addField}
                variant="outline"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
            
            {errors.fields && (
              <p className="text-sm text-red-600">{errors.fields}</p>
            )}

            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No fields added yet. Click "Add Field" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Field {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteField(field.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Field Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Required */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required-${field.id}`}
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700">
                          Required field
                        </label>
                      </div>
                    </div>

                    {/* Field Label */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Label *
                      </label>
                      <Input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="e.g., Customer Name, Service Type, etc."
                        className={errors[`field_${index}_label`] ? 'border-red-300 focus:ring-red-500' : ''}
                      />
                      {errors[`field_${index}_label`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`field_${index}_label`]}</p>
                      )}
                    </div>

                    {/* Options for radio, dropdown, multiple choice */}
                    {(field.type === 'radio' || field.type === 'dropdown' || field.type === 'multiple_choice') && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options *
                        </label>
                        <div className="space-y-2">
                          {field.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(field.id, optionIndex)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(field.id)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                        {errors[`field_${index}_options`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`field_${index}_options`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{form ? 'Update Form' : 'Create Form'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
