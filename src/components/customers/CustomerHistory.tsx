'use client'

import React, { useState } from 'react'
import { X, Clock, DollarSign, MapPin, Calendar, Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

interface Job {
  id: string
  title: string
  date: string
  time: string
  duration: number
  location: string
  amount: number
  status: 'completed' | 'cancelled' | 'pending'
  notes: string
  rating: number
  review: string
}

interface CustomerHistoryProps {
  customer: Customer
  onClose: () => void
}

export function CustomerHistory({ customer, onClose }: CustomerHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'completed' | 'upcoming'>('completed')

  // Mock job history data
  const mockJobs: Job[] = [
    {
      id: 'job-001',
      title: 'House Cleaning',
      date: '2024-01-14',
      time: '10:00 AM',
      duration: 3,
      location: '123 Main Street, Springfield, IL',
      amount: 150.00,
      status: 'completed',
      notes: 'Deep clean requested',
      rating: 5,
      review: 'Excellent service, very thorough!'
    },
    {
      id: 'job-002',
      title: 'Window Washing',
      date: '2024-01-07',
      time: '2:00 PM',
      duration: 2,
      location: '123 Main Street, Springfield, IL',
      amount: 120.00,
      status: 'completed',
      notes: 'All windows cleaned',
      rating: 4,
      review: 'Good job, windows look great'
    },
    {
      id: 'job-003',
      title: 'Office Cleaning',
      date: '2024-01-21',
      time: '9:00 AM',
      duration: 4,
      location: '123 Main Street, Springfield, IL',
      amount: 200.00,
      status: 'pending',
      notes: 'Weekly cleaning service',
      rating: 0,
      review: ''
    }
  ]

  const completedJobs = mockJobs.filter(job => job.status === 'completed')
  const upcomingJobs = mockJobs.filter(job => job.status === 'pending')

  const filteredJobs = (activeTab === 'completed' ? completedJobs : upcomingJobs).filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Job Title', 'Date', 'Time', 'Duration (hrs)', 'Location', 'Amount', 'Status', 'Rating', 'Review', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredJobs.map(job => [
        `"${job.title}"`,
        `"${formatDate(job.date)}"`,
        `"${job.time}"`,
        job.duration,
        `"${job.location}"`,
        job.amount,
        `"${job.status}"`,
        job.rating,
        `"${job.review}"`,
        `"${job.notes}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `customer-history-${customer.customer_id}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Job History - {customer.first_name} {customer.last_name}
            </h2>
            <p className="text-gray-600 mt-1">
              {customer.customer_id} • {customer.total_jobs} jobs • {formatCurrency(customer.total_spent)}
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

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Tabs and Search */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Completed ({completedJobs.length})
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'upcoming'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upcoming ({upcomingJobs.length})
                </button>
              </div>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Jobs Table */}
          <div className="flex-1 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Job</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{job.title}</div>
                            {job.notes && (
                              <div className="text-sm text-gray-500 mt-1">{job.notes}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(job.date)}</div>
                          <div className="text-sm text-gray-500">{job.time}</div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{job.duration} hrs</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{job.location}</div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(job.amount)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {job.rating > 0 ? (
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < job.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">({job.rating})</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {job.review || <span className="text-gray-400">No review</span>}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                        No {activeTab} jobs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}