"use client"

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

const TABS = [
  'Company Context',
  'Plan Catalog',
  'Subscriptions',
  'Invoices',
  'Payments & Dunning',
  'Usage & Overage',
  'Tax & Profiles',
  'Revenue Analytics',
  'Credits',
  'Audit & Logs',
] as const

type TabKey = typeof TABS[number]

const mockCompanies = [
  { id: 'the-home-team', name: 'The Home Team', plan: 'Pro', mrr: '$1,782', status: 'Active' },
  { id: 'primetime-moving', name: 'Primetime Moving', plan: 'Professional', mrr: '$2,940', status: 'Active' },
  { id: 'helprs-test', name: 'Helprs Test Company', plan: 'Enterprise', mrr: '$0', status: 'Internal' },
]

export default function AdminBilling() {
  const [active, setActive] = useState<TabKey>('Company Context')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('the-home-team')
  const [globalView, setGlobalView] = useState<boolean>(true)

  const selectedCompany = useMemo(() => mockCompanies.find(c => c.id === selectedCompanyId), [selectedCompanyId])

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Billing</h2>
        <div className="text-sm text-gray-600">Multi-tenant scaffold • Replace with live data later</div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Scope</span>
          <button onClick={() => setGlobalView(true)} className={`px-3 py-1.5 rounded border text-sm ${globalView ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-200'}`}>Global</button>
          <button onClick={() => setGlobalView(false)} className={`px-3 py-1.5 rounded border text-sm ${!globalView ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-200'}`}>Per Company</button>
        </div>

        {!globalView && (
          <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {mockCompanies.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        )}
      </div>

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

      <section className="space-y-6">
        {active === 'Company Context' && (
          <Card title="Context">
            {globalView ? (
              <div className="text-sm text-gray-700">Global view across all companies. Use tabs to manage catalog, subscriptions, invoices, and more.</div>
            ) : (
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="text-gray-500">Company:</span> {selectedCompany?.name}</div>
                <div><span className="text-gray-500">Plan:</span> {selectedCompany?.plan}</div>
                <div><span className="text-gray-500">MRR:</span> {selectedCompany?.mrr}</div>
                <div><span className="text-gray-500">Status:</span> {selectedCompany?.status}</div>
              </div>
            )}
          </Card>
        )}

        {active === 'Plan Catalog' && <PlanCatalog />}
        {active === 'Subscriptions' && <SubscriptionsTable globalView={globalView} />}
        {active === 'Invoices' && <InvoicesTable globalView={globalView} />}
        {active === 'Payments & Dunning' && <DunningQueue />}
        {active === 'Usage & Overage' && <UsageOverage />}
        {active === 'Tax & Profiles' && <TaxProfiles />}
        {active === 'Revenue Analytics' && <RevenueAnalytics />}
        {active === 'Credits' && <CreditsAdjustments />}
        {active === 'Audit & Logs' && <AuditLogs />}
      </section>
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

function PlanCatalog() {
  return (
    <Card title="Plan Catalog" actions={<Button variant="outline">New Plan</Button>}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Plan</th>
              <th className="px-4 py-2 text-left text-gray-600">Monthly</th>
              <th className="px-4 py-2 text-left text-gray-600">Annual</th>
              <th className="px-4 py-2 text-left text-gray-600">Features</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { plan: 'Basic', m: '$29', a: '$24', f: '5 seats, core' },
              { plan: 'Pro', m: '$99', a: '$79', f: '25 seats, advanced' },
              { plan: 'Enterprise', m: 'Custom', a: 'Custom', f: 'Unlimited, SSO/SAML' },
            ].map((row) => (
              <tr key={row.plan} className="hover:bg-gray-50">
                <td className="px-4 py-2">{row.plan}</td>
                <td className="px-4 py-2">{row.m}</td>
                <td className="px-4 py-2">{row.a}</td>
                <td className="px-4 py-2">{row.f}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Duplicate</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function SubscriptionsTable({ globalView }: { globalView: boolean }) {
  return (
    <Card title={globalView ? 'Company Subscriptions' : 'Subscription'}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {globalView && <th className="px-4 py-2 text-left text-gray-600">Company</th>}
              <th className="px-4 py-2 text-left text-gray-600">Plan</th>
              <th className="px-4 py-2 text-left text-gray-600">Seats</th>
              <th className="px-4 py-2 text-left text-gray-600">Renewal</th>
              <th className="px-4 py-2 text-left text-gray-600">MRR</th>
              <th className="px-4 py-2 text-left text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockCompanies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                {globalView && <td className="px-4 py-2">{c.name}</td>}
                <td className="px-4 py-2">{c.plan}</td>
                <td className="px-4 py-2">18 / 25</td>
                <td className="px-4 py-2">Nov 30, 2025</td>
                <td className="px-4 py-2">{c.mrr}</td>
                <td className="px-4 py-2"><span className="inline-flex rounded-full bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5">{c.status}</span></td>
                <td className="px-4 py-2 space-x-2">
                  <Button size="sm" variant="outline">Change Plan</Button>
                  <Button size="sm" variant="outline">Adjust Seats</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvoicesTable({ globalView }: { globalView: boolean }) {
  return (
    <Card title={globalView ? 'All Invoices' : 'Company Invoices'} actions={<Button variant="outline">Export CSV</Button>}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {globalView && <th className="px-4 py-2 text-left text-gray-600">Company</th>}
              <th className="px-4 py-2 text-left text-gray-600">Date</th>
              <th className="px-4 py-2 text-left text-gray-600">Invoice</th>
              <th className="px-4 py-2 text-left text-gray-600">Amount</th>
              <th className="px-4 py-2 text-left text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockCompanies.map((c, i) => (
              <tr key={c.id} className="hover:bg-gray-50">
                {globalView && <td className="px-4 py-2">{c.name}</td>}
                <td className="px-4 py-2">2025-10-0{i+1}</td>
                <td className="px-4 py-2">INV-10{i+1}00</td>
                <td className="px-4 py-2">{['$1,782.00','$2,940.00','$0.00'][i]}</td>
                <td className="px-4 py-2"><span className="inline-flex rounded-full bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5">Paid</span></td>
                <td className="px-4 py-2 space-x-2">
                  <Button variant="outline" size="sm">PDF</Button>
                  <Button variant="outline" size="sm">Resend</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function DunningQueue() {
  return (
    <Card title="Payments & Dunning">
      <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
        <li>0 failed payments in queue</li>
        <li>Retry policy: 4 attempts over 14 days</li>
        <li>At-risk companies: none</li>
      </ul>
    </Card>
  )
}

function UsageOverage() {
  return (
    <Card title="Usage & Overage">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Usage by Company</div>
          <div className="space-y-2 text-sm text-gray-700">
            {mockCompanies.map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <span>{c.name}</span>
                <span>API 742k / 1M</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Threshold Alerts</div>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>Configure alerts for API, Storage, Seats</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

function TaxProfiles() {
  return (
    <Card title="Tax & Billing Profiles" actions={<Button variant="outline">Manage Profiles</Button>}>
      <div className="text-sm text-gray-700">Manage VAT/GST, tax-exempt flags, currencies, billing contacts and addresses per company.</div>
    </Card>
  )
}

function RevenueAnalytics() {
  return (
    <Card title="Revenue Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Kpi label="MRR" value="$500,000" />
        <Kpi label="New MRR" value="$12,400" />
        <Kpi label="Churn MRR" value="$2,150" />
      </div>
    </Card>
  )
}

function CreditsAdjustments() {
  return (
    <Card title="Credits & Adjustments" actions={<Button variant="outline">Issue Credit</Button>}>
      <div className="text-sm text-gray-700">Track promo codes, credits, and adjustments across companies.</div>
    </Card>
  )
}

function AuditLogs() {
  return (
    <Card title="Audit & Logs">
      <div className="text-sm text-gray-700">Billing-related changes and webhook logs will appear here.</div>
    </Card>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

