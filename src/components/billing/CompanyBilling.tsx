"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const TABS = [
  'Plans',
  'Subscription',
  'Payment Methods',
  'Invoices',
  'Usage',
  'Tax & Settings',
] as const

type TabKey = typeof TABS[number]

export default function CompanyBilling() {
  const [active, setActive] = useState<TabKey>('Plans')

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
        <div className="text-sm text-gray-600">Scaffold • Tenant-facing template</div>
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

      <section>
        {active === 'Plans' && <PlansSection />}
        {active === 'Subscription' && <SubscriptionSection />}
        {active === 'Payment Methods' && <PaymentMethodsSection />}
        {active === 'Invoices' && <InvoicesSection />}
        {active === 'Usage' && <UsageSection />}
        {active === 'Tax & Settings' && <TaxSettingsSection />}
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

function PlansSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Billing cadence</div>
        <div className="flex items-center gap-2 text-sm">
          <button className="px-3 py-1.5 rounded border border-blue-300 bg-blue-50 text-blue-700">Monthly</button>
          <button className="px-3 py-1.5 rounded border border-gray-200 text-gray-700">Annual</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanTile name="Basic" price="$29" features={["Up to 5 seats", "Email support", "Core features"]} cta="Choose Basic" />
        <PlanTile name="Pro" price="$99" features={["Up to 25 seats", "Priority support", "Advanced features"]} cta="Choose Pro" highlighted />
        <PlanTile name="Enterprise" price="Custom" features={["Unlimited seats", "SLA support", "SSO / SAML"]} cta="Contact Sales" />
      </div>
      <div className="text-xs text-gray-500">Note: Plan changes are prorated mid-cycle.</div>
    </div>
  )
}

function PlanTile({ name, price, features, cta, highlighted }: { name: string; price: string; features: string[]; cta: string; highlighted?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 ${highlighted ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-baseline justify-between">
        <div className="text-lg font-semibold text-gray-900">{name}</div>
        <div className="text-2xl font-bold text-gray-900">{price}<span className="text-sm font-normal text-gray-500">/mo</span></div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc pl-5">
        {features.map((f) => (<li key={f}>{f}</li>))}
      </ul>
      <Button className="mt-4">{cta}</Button>
    </div>
  )
}

function SubscriptionSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Current Subscription" actions={<Button variant="outline">Change Plan</Button>}>
        <div className="text-sm text-gray-700 space-y-2">
          <div><span className="text-gray-500">Plan:</span> Pro</div>
          <div><span className="text-gray-500">Seats:</span> 18 / 25</div>
          <div><span className="text-gray-500">Renews:</span> Nov 30, 2025</div>
          <div><span className="text-gray-500">Next charge:</span> $1,782</div>
        </div>
      </Card>
      <Card title="Actions">
        <div className="flex flex-wrap gap-2">
          <Button>Add Seats</Button>
          <Button variant="outline">Remove Seats</Button>
          <Button variant="outline">Cancel Subscription</Button>
          <Button variant="outline">Resume</Button>
        </div>
      </Card>
    </div>
  )
}

function PaymentMethodsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Primary Payment Method" actions={<Button variant="outline">Update</Button>}>
        <div className="text-sm text-gray-700">Visa •••• 4242 — exp 10/28</div>
      </Card>
      <Card title="Billing Contact & Company" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700 space-y-2">
          <div>Helprs Inc.</div>
          <div>billing@helprs.com</div>
          <div>123 Market St, San Francisco, CA</div>
          <div>Tax ID: 12-3456789</div>
        </div>
      </Card>
    </div>
  )
}

function InvoicesSection() {
  return (
    <Card title="Invoices" actions={<Button variant="outline">Export CSV</Button>}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Date</th>
              <th className="px-4 py-2 text-left text-gray-600">Invoice</th>
              <th className="px-4 py-2 text-left text-gray-600">Amount</th>
              <th className="px-4 py-2 text-left text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { date: '2025-10-01', num: 'INV-10234', amount: '$1,782.00', status: 'Paid' },
              { date: '2025-09-01', num: 'INV-10188', amount: '$1,621.00', status: 'Paid' },
              { date: '2025-08-01', num: 'INV-10142', amount: '$1,590.00', status: 'Paid' },
            ].map((row) => (
              <tr key={row.num} className="hover:bg-gray-50">
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.num}</td>
                <td className="px-4 py-2">{row.amount}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex rounded-full bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5">{row.status}</span>
                </td>
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

function UsageSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Current Period Usage">
        <div className="space-y-3 text-sm text-gray-700">
          <Quota label="API Calls" used={742_300} total={1_000_000} />
          <Quota label="Storage" used={"38 GB" as unknown as number} total={"100 GB" as unknown as number} />
          <Quota label="Seats" used={18} total={25} />
        </div>
      </Card>
      <Card title="Threshold Alerts" actions={<Button variant="outline">Manage Alerts</Button>}>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Approaching 80% of API Calls quota</li>
          <li>Seats usage at 72% of limit</li>
        </ul>
      </Card>
    </div>
  )
}

function Quota({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = typeof used === 'number' && typeof total === 'number' && total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-gray-700">{label}</div>
        <div className="text-gray-900 font-medium">{typeof used === 'number' ? used.toLocaleString() : used} / {typeof total === 'number' ? total.toLocaleString() : total}</div>
      </div>
      <div className="mt-2 h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-600 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function TaxSettingsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Tax & Compliance" actions={<Button variant="outline">Edit</Button>}>
        <div className="text-sm text-gray-700 space-y-2">
          <div>VAT/GST: Enabled</div>
          <div>Tax Exempt: No</div>
          <div>Currency: USD</div>
        </div>
      </Card>
      <Card title="Coupons & Credits" actions={<Button variant="outline">Apply Code</Button>}>
        <div className="text-sm text-gray-700">No active discounts</div>
      </Card>
      <Card title="Exports">
        <div className="flex gap-2">
          <Button variant="outline">Download Invoices CSV</Button>
          <Button variant="outline">Export Billing Data</Button>
        </div>
      </Card>
    </div>
  )
}



