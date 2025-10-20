'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, MapPin, Star, Filter, Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface JobHistoryProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
}

interface JobData {
  id: string
  title: string
  customerName: string
  location: string
  startDate: string
  endDate: string
  status: 'completed' | 'upcoming' | 'in-progress' | 'cancelled'
  rating?: number
  notes?: string
  duration: number // in hours
  pay: number
}

export function JobHistory({ isOpen, onClose, userId, userName }: JobHistoryProps) {
  const [activeTab, setActiveTab] = useState<'completed' | 'upcoming'>('completed')
  const [jobs, setJobs] = useState<JobData[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // Load job data
  useEffect(() => {
    if (isOpen) {
      loadJobHistory()
    }
  }, [isOpen, userId])

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesTab = activeTab === 'completed' ? job.status === 'completed' : job.status === 'upcoming'
      const matchesSearch = searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === '' || job.status === statusFilter
      
      return matchesTab && matchesSearch && matchesStatus
    })
    
    setFilteredJobs(filtered)
  }, [jobs, activeTab, searchTerm, statusFilter])

  const loadJobHistory = async () => {
    setLoading(true)
    try {
      // Mock data - in real app, this would fetch from API
      const mockJobs: JobData[] = [
        {
          id: '1',
          title: 'House Cleaning - Downtown',
          customerName: 'John Smith',
          location: '123 Main St, Downtown',
          startDate: '2024-01-15T09:00:00Z',
          endDate: '2024-01-15T13:00:00Z',
          status: 'completed',
          rating: 5,
          notes: 'Excellent work, very thorough',
          duration: 4,
          pay: 120
        },
        {
          id: '2',
          title: 'Office Deep Clean',
          customerName: 'ABC Corporation',
          location: '456 Business Ave, Midtown',
          startDate: '2024-01-18T08:00:00Z',
          endDate: '2024-01-18T16:00:00Z',
          status: 'completed',
          rating: 4,
          notes: 'Good work, minor issues with windows',
          duration: 8,
          pay: 200
        },
        {
          id: '3',
          title: 'Post-Construction Cleanup',
          customerName: 'Sarah Johnson',
          location: '789 New Home Dr, Suburbs',
          startDate: '2024-01-22T10:00:00Z',
          endDate: '2024-01-22T18:00:00Z',
          status: 'upcoming',
          duration: 8,
          pay: 250
        },
        {
          id: '4',
          title: 'Weekly Maintenance',
          customerName: 'Mike Wilson',
          location: '321 Residential St, North Side',
          startDate: '2024-01-25T14:00:00Z',
          endDate: '2024-01-25T16:00:00Z',
          status: 'upcoming',
          duration: 2,
          pay: 60
        },
        {
          id: '5',
          title: 'Move-Out Cleaning',
          customerName: 'Lisa Brown',
          location: '654 Apartment Blvd, East Side',
          startDate: '2024-01-12T11:00:00Z',
          endDate: '2024-01-12T15:00:00Z',
          status: 'completed',
          rating: 5,
          notes: 'Perfect job, highly recommend',
          duration: 4,
          pay: 140
        }
      ]
      
      setJobs(mockJobs)
    } catch (error) {
      console.error('Error loading job history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const exportToCSV = () => {
    const csvData = filteredJobs.map(job => ({
      'Job Title': job.title,
      'Customer': job.customerName,
      'Location': job.location,
      'Date': formatDate(job.startDate),
      'Time': `${formatTime(job.startDate)} - ${formatTime(job.endDate)}`,
      'Status': job.status,
      'Duration (hours)': job.duration,
      'Pay': `$${job.pay}`,
      'Rating': job.rating ? `${job.rating}/5` : 'No rating',
      'Reviews': job.notes || 'No review text'
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${userName}-job-history.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Job History</h2>
              <p className="text-sm text-gray-600">{userName}</p>
            </div>
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed Jobs ({jobs.filter(j => j.status === 'completed').length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming Jobs ({jobs.filter(j => j.status === 'upcoming').length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs, customers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-300px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500">
                {activeTab === 'completed' 
                  ? 'No completed jobs match your search criteria.'
                  : 'No upcoming jobs scheduled.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Pay</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{job.customerName}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={job.location}>{job.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(job.startDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatTime(job.startDate)} - {formatTime(job.endDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 whitespace-nowrap">{job.duration}h</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-semibold text-green-600 whitespace-nowrap">${job.pay}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {job.rating ? (
                          <div className="flex items-center space-x-2">
                            {renderStars(job.rating)}
                            <span className="text-xs text-gray-600">({job.rating}/5)</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {job.notes ? (
                          <div className="max-w-[200px]">
                            <p className="text-sm text-gray-700 truncate" title={job.notes}>{job.notes}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
