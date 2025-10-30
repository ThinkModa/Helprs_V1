"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const TABS = [
  'Billing Config',
  'Integrations & Webhooks',
  'Branding & Comms',
  'API & Developer',
  'Data & Compliance',
  'Observability & Environment',
] as const

type TabKey = typeof TABS[number]

export default function AdminSettings() {
  const [active, setActive] = useState<TabKey>('Billing Config')

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <div className="text-sm text-gray-600">Admin (multi-tenant) settings scaffold</div>
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

      {active === 'Billing Config' && <BillingConfig />}
      {active === 'Integrations & Webhooks' && <IntegrationsWebhooks />}
      {active === 'Branding & Comms' && <BrandingComms />}
      {active === 'API & Developer' && <ApiDeveloper />}
      {active === 'Data & Compliance' && <DataCompliance />}
      {active === 'Observability & Environment' && <ObservabilityEnv />}
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

function BillingConfig() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Processor Mode & Keys" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700 space-y-2">
          <div>Mode: Test</div>
          <div>Publishable Key: ••••</div>
          <div>Secret Key: ••••</div>
        </div>
      </Card>
      <Card title="Dunning Policy" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700">4 retries over 14 days • 7-day grace period</div>
      </Card>
      <Card title="Invoice Defaults" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700">Memo/footer placeholders • PDF template</div>
      </Card>
      <Card title="Tax / VAT" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700">VAT/GST: Enabled • Currency: USD</div>
      </Card>
    </div>
  )
}

function IntegrationsWebhooks() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Core Integrations" actions={<Button variant="outline">Manage</Button>}>
        <div className="text-sm text-gray-700">Slack • Zendesk • Intercom (placeholders)</div>
      </Card>
      <Card title="Webhooks" actions={<Button variant="outline">Test Event</Button>}>
        <div className="text-sm text-gray-700 space-y-2">
          <div>Endpoint URL: https://example.com/webhooks</div>
          <div>Secret: ••••</div>
          <div>Delivery log: 0 recent failures</div>
        </div>
      </Card>
    </div>
  )
}

function BrandingComms() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Branding" actions={<Button variant="outline">Upload</Button>}>
        <div className="text-sm text-gray-700">Logo • Brand color</div>
      </Card>
      <Card title="Email Sender Profile" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700">From: support@helprs.com • Sender name: Helprs</div>
      </Card>
      <Card title="System Banner" actions={<Button variant="outline">Toggle</Button>}>
        <div className="text-sm text-gray-700">Maintenance / announcement banner (off)</div>
      </Card>
    </div>
  )
}

function ApiDeveloper() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Admin API Keys" actions={<Button variant="outline">Create</Button>}>
        <div className="text-sm text-gray-700">0 keys • scopes & rate limits placeholder</div>
      </Card>
      <Card title="Sandbox / Test Tenants" actions={<Button variant="outline">Manage</Button>}>
        <div className="text-sm text-gray-700">Provision test tenants and credentials</div>
      </Card>
    </div>
  )
}

function DataCompliance() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Data Retention" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700">Retention window: 12 months</div>
      </Card>
      <Card title="Export / DSAR" actions={<Button variant="outline">Export</Button>}>
        <div className="text-sm text-gray-700">Export datasets and handle data requests</div>
      </Card>
      <Card title="PII Registry" actions={<Button variant="outline">Open</Button>}>
        <div className="text-sm text-gray-700">Track fields and access controls</div>
      </Card>
    </div>
  )
}

function ObservabilityEnv() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Error Reporting & Logs" actions={<Button variant="outline">Configure</Button>}>
        <div className="text-sm text-gray-700">Provider key • Log level • Sinks</div>
      </Card>
      <Card title="Environment & Toggles" actions={<Button variant="outline">Update</Button>}>
        <div className="text-sm text-gray-700">Env: Development • Maintenance: Off • Read-only: Off</div>
      </Card>
    </div>
  )
}


