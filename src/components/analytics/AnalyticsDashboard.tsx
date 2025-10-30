"use client"

import React from 'react'

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key KPIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="MRR" value="$500,000" delta="+6.2% MoM" positive />
          <KpiCard label="Active Customers" value="500" delta="+3.4% MoM" positive />
          <KpiCard label="NRR" value="112%" delta="+1.1 pts" positive />
          <KpiCard label="Churn (Logo)" value="1.8%" delta="-0.3 pts" negative />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="MRR Trend (6 mo)">
          <PlaceholderChart />
        </ChartCard>
        <ChartCard title="User Growth (Signups vs Activations)">
          <PlaceholderChart />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Acquisition → Activation → Retention Funnel">
          <div className="grid grid-cols-3 gap-4">
            <FunnelStep label="Acquisition" value="2,340" />
            <FunnelStep label="Activation" value="1,580" />
            <FunnelStep label="30d Retained" value="1,210" />
          </div>
        </ChartCard>
        <ChartCard title="Cohort Retention (by signup month)">
          <PlaceholderHeatmap />
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Feature Adoption">
          <PlaceholderBars />
        </ChartCard>
        <ChartCard title="DAU / MAU (Stickiness)">
          <div className="flex items-baseline space-x-3">
            <div className="text-3xl font-bold text-gray-900">27%</div>
            <div className="text-sm text-gray-500">DAU 1,320 / MAU 4,854</div>
          </div>
        </ChartCard>
        <ChartCard title="Billing Health (Failures vs Recovered)">
          <PlaceholderDonut />
        </ChartCard>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Segments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SegmentCard title="By Plan" items={[{ k: 'Enterprise', v: '38%' }, { k: 'Pro', v: '44%' }, { k: 'Basic', v: '18%' }]} />
          <SegmentCard title="By Region" items={[{ k: 'US', v: '61%' }, { k: 'EU', v: '27%' }, { k: 'Other', v: '12%' }]} />
          <SegmentCard title="By Channel" items={[{ k: 'Organic', v: '53%' }, { k: 'Paid', v: '29%' }, { k: 'Referral', v: '18%' }]} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Health & Alerts">
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2">
            <li>Uptime (30d): 99.96%</li>
            <li>Error rate (24h): 0.21%</li>
            <li className="text-amber-600">Anomaly: Spike in failed payments detected (08:00–09:00)</li>
          </ul>
        </ChartCard>
        <ChartCard title="Exports & Drill-downs">
          <div className="text-sm text-gray-700 space-y-2">
            <div>Export CSV • Revenue, Users, Events</div>
            <div>Compare ranges • WoW / MoM / YoY</div>
            <div>Filters • Date range, Plan, Region</div>
          </div>
        </ChartCard>
      </section>
    </div>
  )
}

function KpiCard({ label, value, delta, positive, negative }: { label: string; value: string; delta?: string; positive?: boolean; negative?: boolean }) {
  const deltaColor = positive ? 'text-green-600' : negative ? 'text-red-600' : 'text-gray-600'
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      {delta ? <div className={`mt-1 text-xs ${deltaColor}`}>{delta}</div> : null}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
      <div className="min-h-[180px] flex items-center justify-center">{children}</div>
    </div>
  )
}

function PlaceholderChart() {
  return <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
}

function PlaceholderBars() {
  return (
    <div className="w-full h-32 flex items-end space-x-2">
      {[20, 60, 40, 80, 50, 70].map((h, i) => (
        <div key={i} className="flex-1 bg-gray-200 rounded" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function PlaceholderDonut() {
  return (
    <div className="w-24 h-24 rounded-full bg-gray-200 relative">
      <div className="absolute inset-3 rounded-full bg-white" />
    </div>
  )
}

function PlaceholderHeatmap() {
  return (
    <div className="grid grid-cols-6 gap-1 w-full">
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} className="h-6 rounded" style={{ backgroundColor: `rgba(59,130,246,${0.15 + ((i % 6) * 0.12)})` }} />
      ))}
    </div>
  )
}

function FunnelStep({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function SegmentCard({ title, items }: { title: string; items: { k: string; v: string }[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.k} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{it.k}</span>
            <span className="font-medium text-gray-900">{it.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


