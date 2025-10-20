'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  Filter, 
  Search, 
  ArrowUpDown, 
  Grid3X3, 
  LayoutGrid,
  Eye,
  Copy,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FormForm } from './FormForm'

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
  form_type: string
  is_active: boolean
  field_count: number
  created_at: string
  updated_at: string
  created_by: string | null
}

interface FormsManagementProps {
  companyId: string
}

export function FormsManagement({ companyId }: FormsManagementProps) {
  console.log('FormsManagement component mounted with companyId:', companyId)
  
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'fields'>('name')
  const [showForm, setShowForm] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [selectedForm, setSelectedForm] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card')

  // Mock data for demonstration purposes
  const mockForms: Form[] = [
    {
      id: 'form-001',
      company_id: 'master-template',
      name: 'House Cleaning Checklist',
      description: 'Gather customer preferences and special instructions for house cleaning services',
      form_type: 'checklist',
      is_active: true,
      field_count: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin'
    },
    {
      id: 'form-002',
      company_id: 'master-template',
      name: 'Plumbing Assessment',
      description: 'Assess plumbing issues and requirements before starting work',
      form_type: 'assessment',
      is_active: true,
      field_count: 12,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin'
    },
    {
      id: 'form-003',
      company_id: 'master-template',
      name: 'Move-In/Move-Out Form',
      description: 'Deep cleaning requirements and damage assessment for moving services',
      form_type: 'inspection',
      is_active: true,
      field_count: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin'
    },
    {
      id: 'form-004',
      company_id: 'master-template',
      name: 'Office Cleaning Requirements',
      description: 'Specific requirements and preferences for commercial office cleaning',
      form_type: 'requirements',
      is_active: true,
      field_count: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin'
    },
    {
      id: 'form-005',
      company_id: 'master-template',
      name: 'Landscaping Consultation',
      description: 'Garden design preferences and maintenance requirements',
      form_type: 'consultation',
      is_active: false,
      field_count: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin'
    },
    {
      id: 'form-006',
      company_id: 'master-template',
      name: 'HVAC Service Report',
      description: 'System checks, filter changes, and maintenance recommendations',
      form_type: 'report',
      is_active: true,
      field_count: 9,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-master-admin'
    }
  ]

  useEffect(() => {
    console.log('useEffect triggered for companyId:', companyId)
    // Simulate loading
    setTimeout(() => {
      console.log('Setting forms:', mockForms.length, 'items')
      setForms(mockForms)
      setLoading(false)
    }, 1000)
  }, [companyId])

  // Close dropdown when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setSelectedForm(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const getFormTypeIcon = (type: string) => {
    switch (type) {
      case 'checklist':
        return <FileText className="w-4 h-4" />
      case 'assessment':
        return <FileText className="w-4 h-4" />
      case 'inspection':
        return <FileText className="w-4 h-4" />
      case 'requirements':
        return <FileText className="w-4 h-4" />
      case 'consultation':
        return <FileText className="w-4 h-4" />
      case 'report':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'checklist':
        return 'Checklist'
      case 'assessment':
        return 'Assessment'
      case 'inspection':
        return 'Inspection'
      case 'requirements':
        return 'Requirements'
      case 'consultation':
        return 'Consultation'
      case 'report':
        return 'Report'
      default:
        return 'General'
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesType = filterType === 'all' || form.form_type === filterType
    return matchesSearch && matchesType
  })

  const sortedForms = [...filteredForms].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy === 'type') {
      return a.form_type.localeCompare(b.form_type)
    } else if (sortBy === 'fields') {
      return b.field_count - a.field_count
    }
    return 0
  })

  const handleCreateForm = () => {
    setEditingForm(null)
    setShowForm(true)
  }

  const handleEditForm = (form: Form) => {
    console.log('Edit form clicked:', form.name)
    setEditingForm(form)
    setShowForm(true)
  }

  const handleDeleteForm = (formId: string) => {
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      setForms(forms.filter(f => f.id !== formId))
    }
  }

  const handleToggleActive = (formId: string) => {
    setForms(forms.map(f => 
      f.id === formId 
        ? { ...f, is_active: !f.is_active, updated_at: new Date().toISOString() }
        : f
    ))
  }

  const handleFormSubmit = (formData: any) => {
    if (editingForm) {
      // Update existing form
      setForms(forms.map(f => 
        f.id === editingForm.id 
          ? { ...f, ...formData, updated_at: new Date().toISOString() }
          : f
      ))
    } else {
      // Create new form
      const newForm: Form = {
        ...formData,
        id: `form-${Math.random().toString(36).substr(2, 9)}`,
        company_id: companyId,
        field_count: 0, // Will be updated when fields are added
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'mock-user-id',
      }
      setForms([...forms, newForm])
    }
    setShowForm(false)
    setEditingForm(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showForm) {
    console.log('Rendering FormForm, editingForm:', editingForm?.name || 'new')
    return (
      <FormForm
        form={editingForm}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false)
          setEditingForm(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Forms Management</h2>
          <p className="text-gray-600 mt-1">
            Create and manage custom forms for data collection
          </p>
        </div>
        <Button 
          onClick={handleCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Form
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="checklist">Checklist</option>
            <option value="assessment">Assessment</option>
            <option value="inspection">Inspection</option>
            <option value="requirements">Requirements</option>
            <option value="consultation">Consultation</option>
            <option value="report">Report</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'fields')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="fields">Sort by Fields</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forms List */}
      {sortedForms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first form.'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <Button onClick={handleCreateForm} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </Button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedForms.map((form) => (
            <Card key={form.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getFormTypeIcon(form.form_type)}
                    <span className="text-sm font-medium text-gray-600">
                      {getFormTypeLabel(form.form_type)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {form.name}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      form.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      console.log('Three-dot menu clicked for:', form.name)
                      setSelectedForm(selectedForm === form.id ? null : form.id)
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {selectedForm === form.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                      <button
                        onClick={() => {
                          console.log('Edit button clicked for:', form.name)
                          handleEditForm(form)
                          setSelectedForm(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          handleToggleActive(form.id)
                          setSelectedForm(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        {form.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        <span>{form.is_active ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => {
                          // Handle duplicate
                          setSelectedForm(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteForm(form.id)
                          setSelectedForm(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Description */}
                {form.description && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {form.description}
                  </div>
                )}

                {/* Field Count */}
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{form.field_count} field{form.field_count !== 1 ? 's' : ''}</span>
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-500">
                  Created {new Date(form.created_at).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Grid View
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fields
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedForms.map((form) => {
                  return (
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              {getFormTypeIcon(form.form_type)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {form.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {form.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getFormTypeLabel(form.form_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {form.field_count} field{form.field_count !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          form.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {form.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditForm(form)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(form.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {form.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
