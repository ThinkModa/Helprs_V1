"use client"

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

const TABS = [
  'Ticket Queue',
  'Company Context',
  'SLAs & Escalations',
  'Broadcasts',
  'Support Analytics',
] as const

type TabKey = typeof TABS[number]

const mockTickets = [
  { id: 'TCK-1023', company: 'The Home Team', priority: 'High', sla: '2h', status: 'Open', assignee: 'Alex' },
  { id: 'TCK-1019', company: 'Primetime Moving', priority: 'Normal', sla: '8h', status: 'In Progress', assignee: 'Sam' },
  { id: 'TCK-1018', company: 'Helprs Test Company', priority: 'Low', sla: '24h', status: 'Open', assignee: '-' },
  { id: 'TCK-1017', company: 'The Home Team', priority: 'Normal', sla: '8h', status: 'Resolved', assignee: 'Mia' },
]

const mockCompanies = [
  { id: 'the-home-team', name: 'The Home Team', plan: 'Pro', mrr: '$1,782', usage: 'API 742k/1M', dunning: 'OK' },
  { id: 'primetime-moving', name: 'Primetime Moving', plan: 'Professional', mrr: '$2,940', usage: 'API 880k/1M', dunning: 'OK' },
  { id: 'helprs-test', name: 'Helprs Test Company', plan: 'Enterprise', mrr: '$0', usage: 'Internal', dunning: 'N/A' },
]

export default function AdminSupport() {
  const [active, setActive] = useState<TabKey>('Ticket Queue')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('the-home-team')
  const selectedCompany = useMemo(() => mockCompanies.find(c => c.id === selectedCompanyId), [selectedCompanyId])

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Support</h2>
        <div className="text-sm text-gray-600">Admin (multi-tenant) scaffold</div>
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

      {active === 'Ticket Queue' && <TicketQueue />}
      {active === 'Company Context' && (
        <CompanyContext selectedCompanyId={selectedCompanyId} setSelectedCompanyId={setSelectedCompanyId} selectedCompany={selectedCompany} />
      )}
      {active === 'SLAs & Escalations' && <SlasEscalations />}
      {active === 'Broadcasts' && <Broadcasts />}
      {active === 'Support Analytics' && <SupportAnalytics />}
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

function TicketQueue() {
  const [company, setCompany] = useState<string>('All')
  const [priority, setPriority] = useState<string>('All')
  const [status, setStatus] = useState<string>('All')

  const companies = useMemo(() => ['All', ...Array.from(new Set(mockTickets.map(t => t.company)))], [])
  const priorities = ['All', 'High', 'Normal', 'Low']
  const statuses = ['All', 'Open', 'In Progress', 'Resolved']

  const filtered = useMemo(() => {
    return mockTickets.filter(t =>
      (company === 'All' || t.company === company) &&
      (priority === 'All' || t.priority === priority) &&
      (status === 'All' || t.status === status)
    )
  }, [company, priority, status])

  return (
    <Card title="Global Ticket Queue">
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={company} onChange={(e) => setCompany(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {companies.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {priorities.map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {statuses.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        <Button variant="outline" onClick={() => { setCompany('All'); setPriority('All'); setStatus('All') }}>Clear</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Ticket</th>
              <th className="px-4 py-2 text-left text-gray-600">Company</th>
              <th className="px-4 py-2 text-left text-gray-600">Priority</th>
              <th className="px-4 py-2 text-left text-gray-600">SLA</th>
              <th className="px-4 py-2 text-left text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-gray-600">Assignee</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.company}</td>
                <td className="px-4 py-2">{t.priority}</td>
                <td className="px-4 py-2">{t.sla}</td>
                <td className="px-4 py-2">{t.status}</td>
                <td className="px-4 py-2">{t.assignee}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button variant="outline" size="sm">Open</Button>
                  <Button variant="outline" size="sm">Assign</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function CompanyContext({ selectedCompanyId, setSelectedCompanyId, selectedCompany }: { selectedCompanyId: string; setSelectedCompanyId: (v: string) => void; selectedCompany?: { name: string; plan: string; mrr: string; usage: string; dunning: string } }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Company Selector">
        <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {mockCompanies.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </Card>
      <Card title="Context">
        <div className="text-sm text-gray-700 space-y-1">
          <div><span className="text-gray-500">Company:</span> {selectedCompany?.name}</div>
          <div><span className="text-gray-500">Plan:</span> {selectedCompany?.plan}</div>
          <div><span className="text-gray-500">MRR:</span> {selectedCompany?.mrr}</div>
          <div><span className="text-gray-500">Usage:</span> {selectedCompany?.usage}</div>
          <div><span className="text-gray-500">Dunning:</span> {selectedCompany?.dunning}</div>
        </div>
      </Card>
    </div>
  )
}

function SlasEscalations() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="SLA Policies" actions={<Button variant="outline">Edit</Button>}>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Pro: First response 2h, resolution 24h</li>
          <li>Enterprise: First response 1h, resolution 12h</li>
        </ul>
      </Card>
      <Card title="Escalations">
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>L1 → L2 after 8h open</li>
          <li>Escalate to Engineering on incident-linked tickets</li>
        </ul>
      </Card>
    </div>
  )
}

function Broadcasts() {
  return (
    <Card title="Broadcasts" actions={<Button variant="outline">New Broadcast</Button>}>
      <div className="text-sm text-gray-700">Send maintenance or policy updates to selected tenants. (Scaffold)</div>
    </Card>
  )
}

function SupportAnalytics() {
  return (
    <Card title="Support Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Kpi label="Open" value="12" />
        <Kpi label="First Response (avg)" value="1.4h" />
        <Kpi label="Resolution (avg)" value="9.6h" />
        <Kpi label="CSAT" value="4.7/5" />
      </div>
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


