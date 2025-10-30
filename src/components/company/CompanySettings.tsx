"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const TABS = [
  'Company Profile',
  'User Roles',
  'Branding & Comms',
  'Integrations & Webhooks',
  'API & Developer',
  'Audit Logs',
] as const

type TabKey = typeof TABS[number]

export default function CompanySettings() {
  const [active, setActive] = useState<TabKey>('Company Profile')

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <div className="text-sm text-gray-600">Scaffold • Company template</div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
              active === tab
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {active === 'Company Profile' && <CompanyProfile />}
      {active === 'User Roles' && <UserRoles />}
      {active === 'Branding & Comms' && <BrandingComms />}
      {active === 'Integrations & Webhooks' && <IntegrationsWebhooks />}
      {active === 'API & Developer' && <ApiDeveloper />}
      {active === 'Audit Logs' && <AuditLogs />}
    </div>
  )
}

function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function CompanyProfile() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Profile" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700 space-y-2">
          <div>Company: The Home Team</div>
          <div>Location: Austin, TX</div>
          <div>Business Hours: 8am–6pm</div>
          <div>Contact: info@thehometeam.com</div>
        </div>
      </Card>
      <Card title="Locations" actions={<Button variant="outline">Manage</Button>}>
        <div className="text-sm text-gray-700">HQ + 2 service areas</div>
      </Card>
    </div>
  )
}

function UserRoles() {
  return (
    <Card title="Users & Roles" actions={<Button variant="outline">Invite</Button>}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-gray-600">Role</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: 'Alice Johnson', email: 'alice@thehometeam.com', role: 'Admin' },
              { name: 'Bob Smith', email: 'bob@thehometeam.com', role: 'Manager' },
              { name: 'Chris Lee', email: 'chris@thehometeam.com', role: 'Technician' },
            ].map((u) => (
              <tr key={u.email} className="hover:bg-gray-50">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BrandingComms() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Branding" actions={<Button variant="outline">Upload</Button>}>
        <div className="text-sm text-gray-700">Logo • Brand color</div>
      </Card>
      <Card title="Notifications" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700">Reminders, billing notices, maintenance updates</div>
      </Card>
    </div>
  )
}

function IntegrationsWebhooks() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Integrations" actions={<Button variant="outline">Manage</Button>}>
        <div className="text-sm text-gray-700">Slack • Email • Zapier (placeholders)</div>
      </Card>
      <Card title="Webhooks" actions={<Button variant="outline">Test Event</Button>}>
        <div className="text-sm text-gray-700 space-y-2">
          <div>Endpoint URL: https://example.com/webhooks</div>
          <div>Secret: ••••</div>
        </div>
      </Card>
    </div>
  )
}

function ApiDeveloper() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Company API Keys" actions={<Button variant="outline">Create</Button>}>
        <div className="text-sm text-gray-700">0 keys • scopes placeholder</div>
      </Card>
      <Card title="Rate Limits" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700">Standard limits apply</div>
      </Card>
    </div>
  )
}

function AuditLogs() {
  return (
    <Card title="Audit Logs">
      <div className="text-sm text-gray-700">Key settings changes will appear here. (Scaffold)</div>
    </Card>
  )
}


