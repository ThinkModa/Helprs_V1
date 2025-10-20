'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Building2, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Building2 },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showCompanyMenu, setShowCompanyMenu] = useState(false)
  const pathname = usePathname()
  const { profile, currentCompany, setCurrentCompany, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Helprs</h1>
          </div>

          {/* Company Selector */}
          {profile?.companies && profile.companies.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                >
                  <span className="truncate">
                    {currentCompany?.name || 'Select Company'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {showCompanyMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {profile.companies.map((companyUser) => (
                      <button
                        key={companyUser.company.id}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setCurrentCompany(companyUser.company)
                          setShowCompanyMenu(false)
                        }}
                      >
                        {companyUser.company.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and sign out */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
