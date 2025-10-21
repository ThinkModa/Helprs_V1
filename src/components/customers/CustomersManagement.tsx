'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2, User, ChevronDown, ChevronRight, Download, X, CheckCircle, AlertCircle, Archive, UserX, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { EditCustomerModal } from './EditCustomerModal'
import { CustomerHistory } from './CustomerHistory'
import { AddCustomerModal } from './AddCustomerModal'
import { CustomerService, CustomerWithStats } from '@/lib/database/customers'
import { createClient } from '@/lib/supabase/client'

// Use the CustomerWithStats type from the database service
type Customer = CustomerWithStats

interface CustomersManagementProps {
  companyId: string
}

export function CustomersManagement({ companyId }: CustomersManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [customerService] = useState(() => new CustomerService(createClient()))
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  
  // Enhanced filter states
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    lastJobFrom: '',
    lastJobTo: ''
  })
  
  // Bulk actions state
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)


  useEffect(() => {
    loadCustomers()
  }, [companyId])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const customersData = await customerService.getCustomers(companyId)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced filtering logic
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.city && customer.city.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filters.status === '' || customer.status === filters.status
    const matchesCity = filters.city === '' || (customer.city && customer.city.toLowerCase().includes(filters.city.toLowerCase()))
    
    const lastJobDate = customer.last_job_date ? new Date(customer.last_job_date) : null
    const fromDate = filters.lastJobFrom ? new Date(filters.lastJobFrom) : null
    const toDate = filters.lastJobTo ? new Date(filters.lastJobTo) : null
    
    const matchesLastJobFrom = !fromDate || !lastJobDate || lastJobDate >= fromDate
    const matchesLastJobTo = !toDate || !lastJobDate || lastJobDate <= toDate

    return matchesSearch && matchesStatus && matchesCity && matchesLastJobFrom && matchesLastJobTo
  })

  const handleSelectCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers)
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId)
    } else {
      newSelected.add(customerId)
    }
    setSelectedCustomers(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)))
      setShowBulkActions(true)
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    setBulkActionLoading(true)
    try {
      const updatePromises = Array.from(selectedCustomers).map(customerId =>
        customerService.updateCustomer(customerId, { status: newStatus as any })
      )
      
      await Promise.all(updatePromises)
      
      // Reload customers to get updated data
      await loadCustomers()
      setSelectedCustomers(new Set())
      setShowBulkActions(false)
    } catch (error) {
      console.error('Error updating customer status:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedCustomers.size} customer(s)?`)) {
      return
    }
    
    setBulkActionLoading(true)
    try {
      const deletePromises = Array.from(selectedCustomers).map(customerId =>
        customerService.deleteCustomer(customerId)
      )
      
      await Promise.all(deletePromises)
      
      // Reload customers to get updated data
      await loadCustomers()
      setSelectedCustomers(new Set())
      setShowBulkActions(false)
    } catch (error) {
      console.error('Error deleting customers:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvData = filteredCustomers.map(customer => ({
      'Name': `${customer.first_name} ${customer.last_name}`,
      'Email': customer.email,
      'Customer ID': customer.customer_id,
      'Address': customer.address || '',
      'City': customer.city || '',
      'State': customer.state || '',
      'Zip Code': customer.zip_code || '',
      'Total Jobs': customer.total_jobs,
      'Total Spent': customer.total_spent,
      'Last Job': customer.last_job_title || '',
      'Last Job Date': customer.last_job_date || '',
      'Status': customer.status
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `customers-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  // Modal handlers
  const handleOpenHistory = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowHistoryModal(true)
  }

  const handleCloseModals = () => {
    setShowHistoryModal(false)
    setSelectedCustomer(null)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const success = await customerService.deleteCustomer(customerId)
        if (success) {
          setCustomers(customers.filter(c => c.id !== customerId))
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  const handleCustomerCreated = async (newCustomer: Customer) => {
    try {
      const createdCustomer = await customerService.createCustomer({
        company_id: companyId,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        customer_id: newCustomer.customer_id,
        address: newCustomer.address,
        city: newCustomer.city,
        state: newCustomer.state,
        zip_code: newCustomer.zip_code,
        status: newCustomer.status,
        notes: newCustomer.notes,
        created_by: 'current-user-id', // This would come from auth context
      })
      setCustomers([...customers, createdCustomer])
    } catch (error) {
      console.error('Error creating customer:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">
              {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <Input
                  placeholder="Filter by city"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Last Job From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Job From</label>
                <Input
                  type="date"
                  value={filters.lastJobFrom}
                  onChange={(e) => setFilters({ ...filters, lastJobFrom: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Last Job To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Job To</label>
                <Input
                  type="date"
                  value={filters.lastJobTo}
                  onChange={(e) => setFilters({ ...filters, lastJobTo: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: '', city: '', lastJobFrom: '', lastJobTo: '' })}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Clear All Filters</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCustomers.size} customer{selectedCustomers.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange('active')}
                    disabled={bulkActionLoading}
                    className="flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Activate</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange('inactive')}
                    disabled={bulkActionLoading}
                    className="flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>Deactivate</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange('archived')}
                    disabled={bulkActionLoading}
                    className="flex items-center space-x-1"
                  >
                    <Archive className="w-3 h-3" />
                    <span>Archive</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <UserX className="w-3 h-3" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedCustomers(new Set())
                  setShowBulkActions(false)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900 w-12">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Job History</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{customer.customer_id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {customer.address}
                      </div>
                      {customer.city && (
                        <div className="text-sm text-gray-500">
                          {customer.city}, {customer.state} {customer.zip_code}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {customer.total_jobs} jobs
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(customer.total_spent)}
                      </div>
                      {customer.last_job_title && (
                        <div className="text-xs text-gray-400">
                          Last: {customer.last_job_title}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' :
                      customer.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenHistory(customer)}
                        className="flex items-center space-x-1"
                        title="View job history"
                      >
                        <Clock className="w-3 h-3" />
                        <span>History</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCustomer(customer)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        title="Delete customer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddCustomerModal && (
        <AddCustomerModal
          isOpen={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
          onCustomerCreated={handleCustomerCreated}
          companyId={companyId}
        />
      )}

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={(updatedCustomer) => {
            if (editingCustomer.id) {
              setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c))
            } else {
              setCustomers([...customers, { ...updatedCustomer, id: `cust-${Date.now()}` }])
            }
            setEditingCustomer(null)
          }}
        />
      )}

      {showHistoryModal && selectedCustomer && (
        <CustomerHistory
          customer={selectedCustomer}
          onClose={handleCloseModals}
        />
      )}
    </div>
  )
}