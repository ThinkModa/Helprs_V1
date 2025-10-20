'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Calendar, Check, User, Users, Building2, ChevronDown, ChevronRight, Download, X, CheckCircle, AlertCircle, Archive, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { UserService, UserWithDetails, PositionWithStats } from '@/lib/database/users'
import { AddUserModal } from './AddUserModal'
import { EditUserModal } from './EditUserModal'
import { PositionsManagement } from './PositionsManagement'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { JobHistory } from './JobHistory'

interface TeamsManagementProps {
  companyId: string
}

export function TeamsManagement({ companyId }: TeamsManagementProps) {
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [positions, setPositions] = useState<PositionWithStats[]>([])
  const [calendars, setCalendars] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null)
  const [showPositions, setShowPositions] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showJobHistoryModal, setShowJobHistoryModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null)
  
  // Enhanced filter states
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    department: '',
    hireDateFrom: '',
    hireDateTo: ''
  })
  
  // Bulk actions state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const userService = new UserService({} as any) // Mock service

  // Dropdown options
  const statusOptions = [
    { value: 'active', label: 'Active', color: '#10B981' },
    { value: 'inactive', label: 'Inactive', color: '#F59E0B' },
    { value: 'archived', label: 'Archived', color: '#6B7280' },
    { value: 'terminated', label: 'Terminated', color: '#EF4444' }
  ]

  const roleOptions = [
    { value: 'admin', label: 'Admin', color: '#8B5CF6' },
    { value: 'manager', label: 'Manager', color: '#3B82F6' },
    { value: 'supervisor', label: 'Supervisor', color: '#10B981' },
    { value: 'general', label: 'General', color: '#6B7280' }
  ]

  useEffect(() => {
    loadData()
  }, [companyId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersData, positionsData, calendarsData] = await Promise.all([
        userService.getUsers(companyId),
        userService.getPositions(companyId),
        userService.getCalendars(companyId)
      ])
      setUsers(usersData)
      setPositions(positionsData)
      setCalendars(calendarsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced filtering logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.employee_id && user.employee_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.job_title && user.job_title.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = filters.role === '' || user.role === filters.role
    const matchesStatus = filters.status === '' || user.status === filters.status
    const matchesDepartment = filters.department === '' || (user.department && user.department.toLowerCase().includes(filters.department.toLowerCase()))
    
    // Date filtering
    let matchesHireDate = true
    if (filters.hireDateFrom || filters.hireDateTo) {
      const hireDate = user.hire_date ? new Date(user.hire_date) : null
      if (hireDate) {
        if (filters.hireDateFrom) {
          const fromDate = new Date(filters.hireDateFrom)
          matchesHireDate = matchesHireDate && hireDate >= fromDate
        }
        if (filters.hireDateTo) {
          const toDate = new Date(filters.hireDateTo)
          matchesHireDate = matchesHireDate && hireDate <= toDate
        }
      } else {
        matchesHireDate = false
      }
    }

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment && matchesHireDate
  })

  const handleUserCreated = (newUser: UserWithDetails) => {
    setUsers([...users, newUser])
    setShowAddUserModal(false)
  }

  const handleUserUpdated = (updatedUser: UserWithDetails) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
    setEditingUser(null)
  }

  // Bulk action functions
  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
      setShowBulkActions(true)
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    setBulkActionLoading(true)
    try {
      // In a real app, this would make API calls
      const updatedUsers = users.map(user => 
        selectedUsers.has(user.id) ? { ...user, status: newStatus as any } : user
      )
      setUsers(updatedUsers)
      setSelectedUsers(new Set())
      setShowBulkActions(false)
    } catch (error) {
      console.error('Error updating user statuses:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} users? This action cannot be undone.`)) {
      return
    }
    
    setBulkActionLoading(true)
    try {
      // In a real app, this would make API calls
      const updatedUsers = users.filter(user => !selectedUsers.has(user.id))
      setUsers(updatedUsers)
      setSelectedUsers(new Set())
      setShowBulkActions(false)
    } catch (error) {
      console.error('Error deleting users:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Export functionality
  const handleExportCSV = () => {
    const csvData = filteredUsers.map(user => ({
      'First Name': user.first_name,
      'Last Name': user.last_name,
      'Email': user.email,
      'Employee ID': user.employee_id || '',
      'Role': user.role,
      'Position': user.position_name || '',
      'Department': user.department || '',
      'Status': user.status,
      'Hire Date': user.hire_date || '',
      'Phone': user.phone || ''
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Quick status change function
  const handleQuickStatusChange = async (userId: string, newStatus: string) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, status: newStatus as any } : user
      )
      setUsers(updatedUsers)
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Quick role change function
  const handleQuickRoleChange = async (userId: string, newRole: string) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      )
      setUsers(updatedUsers)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  // Modal handlers
  const handleOpenAvailability = (user: UserWithDetails) => {
    setSelectedUser(user)
    setShowAvailabilityModal(true)
  }

  const handleOpenJobHistory = (user: UserWithDetails) => {
    setSelectedUser(user)
    setShowJobHistoryModal(true)
  }

  const handleCloseModals = () => {
    setShowAvailabilityModal(false)
    setShowJobHistoryModal(false)
    setSelectedUser(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showPositions) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Positions Management</h3>
            <p className="text-gray-600 mt-1">Manage job positions and roles for your team</p>
          </div>
          <Button onClick={() => setShowPositions(false)} variant="outline">
            Back to Teams
          </Button>
        </div>
        <PositionsManagement companyId={companyId} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-1">
              {filteredUsers.length} of {users.length} users
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={() => setShowPositions(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Positions</span>
            </Button>
            <Button
              onClick={() => setShowAddUserModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>ADD</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or employee ID..."
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
          </Button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="general">General</option>
                </select>
              </div>

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
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <Input
                  placeholder="Search department..."
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Hire Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date From</label>
                <Input
                  type="date"
                  value={filters.hireDateFrom}
                  onChange={(e) => setFilters({ ...filters, hireDateFrom: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Hire Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date To</label>
                <Input
                  type="date"
                  value={filters.hireDateTo}
                  onChange={(e) => setFilters({ ...filters, hireDateTo: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ role: '', status: '', department: '', hireDateFrom: '', hireDateTo: '' })}
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
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
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
                  setSelectedUsers(new Set())
                  setShowBulkActions(false)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Seats Available Indicator */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Seats Available</span>
            </div>
            <div className="text-sm text-blue-700">
              {users.length} of 50 seats used
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900 w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.profile_picture_url ? (
                          <img
                            src={user.profile_picture_url}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{user.employee_id}</span>
                          {user.position_name && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600">{user.position_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-32">
                      <DropdownSelect
                        value={user.role}
                        options={roleOptions}
                        onChange={(newRole) => handleQuickRoleChange(user.id, newRole)}
                        className="text-xs"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-32">
                      <DropdownSelect
                        value={user.status}
                        options={statusOptions}
                        onChange={(newStatus) => handleQuickStatusChange(user.id, newStatus)}
                        className="text-xs"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAvailability(user)}
                        className="flex items-center space-x-1"
                        title="View availability calendar"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Availability</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenJobHistory(user)}
                        className="flex items-center space-x-1"
                        title="View job history"
                      >
                        <Check className="w-3 h-3" />
                        <span>History</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        title="Delete user"
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
      {showAddUserModal && (
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onUserCreated={handleUserCreated}
          companyId={companyId}
          positions={positions}
          calendars={calendars}
        />
      )}

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
          user={editingUser}
          companyId={companyId}
          positions={positions}
          calendars={calendars}
        />
      )}

      {selectedUser && (
        <>
          <AvailabilityCalendar
            isOpen={showAvailabilityModal}
            onClose={handleCloseModals}
            userId={selectedUser.id}
            userName={`${selectedUser.first_name} ${selectedUser.last_name}`}
          />
          <JobHistory
            isOpen={showJobHistoryModal}
            onClose={handleCloseModals}
            userId={selectedUser.id}
            userName={`${selectedUser.first_name} ${selectedUser.last_name}`}
          />
        </>
      )}
    </div>
  )
}