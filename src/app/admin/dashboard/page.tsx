'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Building2, 
  Users, 
  Rocket, 
  TrendingUp, 
  CreditCard, 
  Headphones, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Monitor,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Play,
  Square,
  Home,
  ClipboardList,
  UserCheck,
  FileText,
  Bell,
  CalendarDays,
  CalendarCheck,
  FileSpreadsheet,
  DollarSign,
  MessageSquare
} from 'lucide-react'
import { CalendarsManagement } from '@/components/calendars/CalendarsManagement'
import { AppointmentsManagement } from '@/components/appointments/AppointmentsManagement'
import { FormsManagement } from '@/components/forms/FormsManagement'
import { InsightsChat } from '@/components/insights/InsightsChat'
import { TeamsManagement } from '@/components/teams/TeamsManagement'
import { CustomersManagement } from '@/components/customers/CustomersManagement'
import { CalendarView } from '@/components/scheduling/CalendarView'

export default function AdminDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [previewCompany, setPreviewCompany] = useState(null)
  const [demoMode, setDemoMode] = useState(false)
  const [demoCompany, setDemoCompany] = useState(null)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'preview', label: 'Company Preview', icon: Monitor },
    { id: 'features', label: 'Feature Flags', icon: Rocket },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: MessageSquare },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const companySidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'calendars', label: 'Calendars', icon: CalendarDays },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
    { id: 'forms', label: 'Forms', icon: FileSpreadsheet },
    { id: 'team', label: 'Team', icon: UserCheck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'insights', label: 'Insights', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const companies = [
    { id: 1, name: 'The Home Team', industry: 'Moving & Storage', users: 12, tier: 'Basic', status: 'Active', created: '2024-01-15' },
    { id: 2, name: 'Primetime Moving', industry: 'Moving & Storage', users: 28, tier: 'Professional', status: 'Active', created: '2024-01-20' },
    { id: 3, name: 'Elite Cleaners', industry: 'Cleaning Services', users: 8, tier: 'Free', status: 'Trial', created: '2024-02-01' },
    { id: 4, name: 'Green Thumb Landscaping', industry: 'Landscaping', users: 15, tier: 'Basic', status: 'Active', created: '2024-02-05' }
  ]

  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@thehometeam.com', company: 'The Home Team', role: 'Admin', lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@primetimemoving.com', company: 'Primetime Moving', role: 'Admin', lastActive: '1 hour ago' },
    { id: 3, name: 'Mike Davis', email: 'mike@elitecleaners.com', company: 'Elite Cleaners', role: 'Manager', lastActive: '3 hours ago' },
    { id: 4, name: 'Lisa Wilson', email: 'lisa@greenthumb.com', company: 'Green Thumb Landscaping', role: 'Admin', lastActive: '5 hours ago' }
  ]

  const featureFlags = [
    { id: 1, name: 'Advanced Analytics', description: 'Enhanced reporting dashboard', enabled: true, companies: 2 },
    { id: 2, name: 'API Access', description: 'REST API for integrations', enabled: false, companies: 0 },
    { id: 3, name: 'White Labeling', description: 'Custom branding options', enabled: true, companies: 1 },
    { id: 4, name: 'Mobile App', description: 'Native mobile application', enabled: false, companies: 0 }
  ]

  const companyPreviewData = {
    'Master Template': {
      id: 0,
      name: 'Master Template',
      industry: 'Template',
      location: 'Global',
      phone: '(000) 000-0000',
      email: 'template@helprs.com',
      website: 'www.helprs.com',
      employees: 0,
      established: '2024',
      logo: null,
      isMasterTemplate: true,
      stats: {
        activeJobs: 0,
        completedJobs: 0,
        totalRevenue: '$0',
        avgRating: 0
      },
      recentJobs: [],
      teamMembers: []
    },
    'The Home Team': {
      id: 1,
      name: 'The Home Team',
      industry: 'Moving & Storage',
      location: 'Austin, TX',
      phone: '(512) 555-0123',
      email: 'info@thehometeam.com',
      website: 'www.thehometeam.com',
      employees: 12,
      established: '2019',
      logo: null,
      stats: {
        activeJobs: 8,
        completedJobs: 142,
        totalRevenue: '$45,230',
        avgRating: 4.8
      },
      recentJobs: [
        { id: 1, title: 'Residential Move - Downtown', client: 'Sarah Johnson', date: '2024-02-15', status: 'In Progress', value: '$1,200' },
        { id: 2, title: 'Office Relocation', client: 'TechCorp Inc', date: '2024-02-14', status: 'Completed', value: '$3,500' },
        { id: 3, title: 'Storage Unit Move', client: 'Mike Davis', date: '2024-02-13', status: 'Scheduled', value: '$800' }
      ],
      teamMembers: [
        { id: 1, name: 'John Smith', role: 'Team Lead', status: 'Active', lastActive: '2 hours ago' },
        { id: 2, name: 'Maria Garcia', role: 'Mover', status: 'Active', lastActive: '1 hour ago' },
        { id: 3, name: 'David Wilson', role: 'Driver', status: 'On Break', lastActive: '30 min ago' }
      ]
    },
    'Primetime Moving': {
      id: 2,
      name: 'Primetime Moving',
      industry: 'Moving & Storage',
      location: 'Dallas, TX',
      phone: '(214) 555-0456',
      email: 'contact@primetimemoving.com',
      website: 'www.primetimemoving.com',
      employees: 28,
      established: '2017',
      logo: null,
      stats: {
        activeJobs: 15,
        completedJobs: 387,
        totalRevenue: '$128,450',
        avgRating: 4.9
      },
      recentJobs: [
        { id: 1, title: 'Corporate Relocation', client: 'Global Enterprises', date: '2024-02-15', status: 'In Progress', value: '$8,500' },
        { id: 2, title: 'Luxury Home Move', client: 'Jennifer Lee', date: '2024-02-14', status: 'Completed', value: '$4,200' },
        { id: 3, title: 'Warehouse Move', client: 'Logistics Plus', date: '2024-02-13', status: 'Scheduled', value: '$12,000' }
      ],
      teamMembers: [
        { id: 1, name: 'Sarah Johnson', role: 'Operations Manager', status: 'Active', lastActive: '5 min ago' },
        { id: 2, name: 'Robert Chen', role: 'Senior Mover', status: 'Active', lastActive: '15 min ago' },
        { id: 3, name: 'Lisa Martinez', role: 'Customer Service', status: 'Active', lastActive: '1 hour ago' }
      ]
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">63</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$2,450</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">+23%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">New company "Elite Cleaners" signed up</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Primetime Moving upgraded to Professional tier</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Feature flag "Advanced Analytics" enabled for 2 companies</p>
              <p className="text-xs text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCompanies = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">All Companies</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                  <div className="text-sm text-gray-500">Created {company.created}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.industry}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.users}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.tier === 'Professional' ? 'bg-purple-100 text-purple-800' :
                    company.tier === 'Basic' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {company.tier}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {company.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3 flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 flex items-center">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastActive}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3 flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 flex items-center">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderFeatureFlags = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Feature Flags</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Feature Flag
        </Button>
        </div>
        
        <div className="space-y-4">
          {featureFlags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900">{flag.name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{flag.description}</p>
                <p className="text-xs text-gray-400 mt-1">Used by {flag.companies} companies</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm flex items-center">
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm flex items-center">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCompanyDashboard = () => {
    if (!demoCompany) return null
    
    const company = companyPreviewData[demoCompany]
    if (!company) return null

    return (
      <div className="space-y-6">
        {/* Master Template Banner */}
        {company.isMasterTemplate && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Master Template Mode</h3>
                <p className="text-sm text-purple-700">
                  You're building the template that will be deployed to all companies. 
                  Changes here will affect the entire platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                company.isMasterTemplate ? 'bg-gradient-to-br from-purple-100 to-blue-100' : 'bg-gray-100'
              }`}>
                <Building2 className={`w-8 h-8 ${
                  company.isMasterTemplate ? 'text-purple-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.industry} • {company.location}</p>
                {!company.isMasterTemplate && (
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {company.phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {company.email}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!company.isMasterTemplate && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">{company.employees}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.activeJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.completedJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.totalRevenue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.avgRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs & Team Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Button>
            </div>
            <div className="space-y-3">
              {company.recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.client} • {job.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{job.value}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
            <div className="space-y-3">
              {company.teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{member.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCompanySchedule = () => {
    // Get the current company ID for the demo
    const currentCompanyId = demoCompany === 'Master Template' 
      ? 'master-template' 
      : demoCompany === 'The Home Team' 
        ? 'the-home-team' 
        : demoCompany === 'Primetime Moving'
          ? 'primetime-moving'
          : 'default-company'

    return (
      <div className="h-full">
        <CalendarView companyId={currentCompanyId} />
      </div>
    )
  }

  const renderCompanyCalendars = () => {
    // Get the current company ID for the demo
    const currentCompanyId = demoCompany === 'Master Template' 
      ? 'master-template' 
      : demoCompany === 'The Home Team' 
        ? 'the-home-team' 
        : demoCompany === 'Primetime Moving'
          ? 'primetime-moving'
          : 'default-company'

    return (
      <div className="p-6">
        <CalendarsManagement companyId={currentCompanyId} />
      </div>
    )
  }

  const renderCompanyAppointments = () => {
    // Get the current company ID for the demo
    const currentCompanyId = demoCompany === 'Master Template' 
      ? 'master-template' 
      : demoCompany === 'The Home Team' 
        ? 'the-home-team' 
        : demoCompany === 'Primetime Moving'
          ? 'primetime-moving'
          : 'default-company'

    return (
      <div className="p-6">
        <AppointmentsManagement companyId={currentCompanyId} />
      </div>
    )
  }

  const renderCompanyForms = () => {
    // Get the current company ID for the demo
    const currentCompanyId = demoCompany === 'Master Template' 
      ? 'master-template' 
      : demoCompany === 'The Home Team' 
        ? 'the-home-team' 
        : 'primetime-moving'
    
    return (
      <div className="p-6">
        <FormsManagement companyId={currentCompanyId} />
      </div>
    )
  }


  const renderCompanyCustomers = () => {
    const currentCompanyId = demoCompany === 'Master Template' 
      ? 'master-template' 
      : demoCompany === 'The Home Team' 
        ? 'the-home-team' 
        : 'primetime-moving'
    
    return (
      <div className="p-6">
        <CustomersManagement companyId={currentCompanyId} />
      </div>
    )
  }

  const renderCompanyPayments = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Management</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Process Payment
        </Button>
      </div>
      <p className="text-gray-600">Payment management interface coming soon...</p>
    </div>
  )

  const renderCompanyReports = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Reports & Analytics</h3>
      <p className="text-gray-600">Reports and analytics interface coming soon...</p>
    </div>
  )

  const renderCompanyNotifications = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h3>
      <p className="text-gray-600">Notifications interface coming soon...</p>
    </div>
  )

  const renderCompanySettings = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Settings</h3>
      <p className="text-gray-600">Company settings interface coming soon...</p>
    </div>
  )

  const renderCompanyPreview = () => {
    if (!previewCompany) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Company to Preview</h3>
            <p className="text-gray-600 mb-6">Choose a company from the dropdown below to see their dashboard view</p>
            
            <div className="max-w-md mx-auto">
              <select 
                value="" 
                onChange={(e) => setPreviewCompany(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a company...</option>
                {Object.keys(companyPreviewData).map((companyName) => (
                  <option key={companyName} value={companyName}>{companyName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )
    }

    const company = companyPreviewData[previewCompany]
    if (!company) return null

    return (
      <div className="space-y-6">
        {/* Preview Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Preview Mode</p>
                <p className="text-xs text-blue-700">Viewing as: <span className="font-semibold">{company.name}</span></p>
              </div>
            </div>
            <Button 
              onClick={() => setPreviewCompany(null)}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Preview
            </Button>
          </div>
        </div>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.industry} • {company.location}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {company.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {company.email}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Est. {company.established}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Team Size</p>
              <p className="text-2xl font-bold text-gray-900">{company.employees}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.activeJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.completedJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.totalRevenue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{company.stats.avgRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs & Team Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
            <div className="space-y-3">
              {company.recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.client} • {job.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{job.value}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            <div className="space-y-3">
              {company.teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{member.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    // Demo mode - render company dashboard sections
    if (demoMode) {
      switch (activeSection) {
        case 'dashboard':
          return renderCompanyDashboard()
        case 'schedule':
          return renderCompanySchedule()
        case 'calendars':
          return renderCompanyCalendars()
        case 'appointments':
          return renderCompanyAppointments()
        case 'forms':
          return renderCompanyForms()
        case 'team':
          return (
            <div className="h-full">
              <TeamsManagement companyId="master-template" />
            </div>
          )
        case 'customers':
          return renderCompanyCustomers()
        case 'payments':
          return renderCompanyPayments()
        case 'reports':
          return renderCompanyReports()
        case 'insights':
          return (
            <div className="h-full">
              <InsightsChat />
            </div>
          )
        case 'settings':
          return renderCompanySettings()
        default:
          return renderCompanyDashboard()
      }
    }

    // Admin mode - render admin dashboard sections
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'companies':
        return renderCompanies()
      case 'users':
        return renderUsers()
      case 'preview':
        return renderCompanyPreview()
      case 'features':
        return renderFeatureFlags()
      case 'insights':
        return (
          <div className="h-full">
            <InsightsChat />
          </div>
        )
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{sidebarItems.find(item => item.id === activeSection)?.label}</h3>
            <p className="text-gray-600">This section is coming soon...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">Helprs Admin</h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        <nav className="mt-4">
          {(demoMode ? companySidebarItems : sidebarItems).map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  activeSection === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {demoMode 
                  ? companySidebarItems.find(item => item.id === activeSection)?.label
                  : sidebarItems.find(item => item.id === activeSection)?.label
                }
              </h2>
              <p className="text-gray-600">
                {demoMode 
                  ? `Demo Mode - ${demoCompany || 'Select Company'}` 
                  : 'Platform Administration Dashboard'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Demo Mode Toggle */}
              {!demoMode ? (
                <div className="flex items-center space-x-2">
                  <select 
                    value={demoCompany || ''} 
                    onChange={(e) => setDemoCompany(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select company for demo...</option>
                    {Object.keys(companyPreviewData).map((companyName) => (
                      <option key={companyName} value={companyName}>{companyName}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={() => {
                      if (demoCompany) {
                        setDemoMode(true)
                        setActiveSection('dashboard')
                      }
                    }}
                    disabled={!demoCompany}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Enter Demo Mode
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    setDemoMode(false)
                    setActiveSection('overview')
                  }}
                  variant="outline"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Exit Demo Mode
                </Button>
              )}
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {demoMode ? demoCompany : 'Super Admin'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button 
                onClick={signOut}
                variant="outline"
                className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
