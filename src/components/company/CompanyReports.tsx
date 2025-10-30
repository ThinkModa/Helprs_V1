"use client"

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

type FilterState = {
  dateRange: string
  team: string
  service: string
}

const mockTeam = ['All', 'Alice', 'Bob', 'Chris', 'Dana']
const mockServices = ['All', 'Move', 'Clean', 'Install']

const KPI_CHART_OPTIONS = [
  'Revenue Over Time',
  'Jobs Per Team Member',
  'Workforce Utilization',
  'Product Usage',
  'Avg Revenue / Job',
  'Avg Payout / Job',
  'Jobs / Day',
  'Jobs / Service Type',
  'Technician Hours',
  'Conversion Rate',
] as const

type KpiChartKey = typeof KPI_CHART_OPTIONS[number]

export default function CompanyReports() {
  const [filters, setFilters] = useState<FilterState>({ dateRange: 'Last 30 days', team: 'All', service: 'All' })
  const [selectedKpiChart, setSelectedKpiChart] = useState<KpiChartKey>('Revenue Over Time')

  const kpis = useMemo(() => ({
    revenue: '$124,500',
    jobs: '386',
    utilization: '72%',
    avgPayout: '$145',
    avgRevenue: '$322',
  }), [filters])

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="text-sm text-gray-600">Scaffold • Company view</div>
      </header>

      <Filters filters={filters} setFilters={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <KpiRow kpis={kpis} />

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Revenue Over Time">
              <MockLineChart />
            </Card>
            <Card title="Jobs Per Team Member">
              <MockBarsLabeled labels={["Alice","Bob","Chris","Dana","Evan"]} values={[52, 71, 38, 45, 60]} />
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Workforce Utilization">
              <MockAreaChart />
            </Card>
            <Card title="Product Usage (Feature Adoption)">
              <MockBarsLabeled labels={["Scheduling","Forms","Payments","Reports","Chat"]} values={[80, 55, 42, 30, 24]} />
            </Card>
          </section>

          <div className="flex gap-2">
            <Button variant="outline">Export CSV</Button>
            <Button variant="outline">Schedule Email Report</Button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">KPI Charts</div>
            <div className="flex flex-col gap-2">
              {KPI_CHART_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedKpiChart(opt)}
                  className={`text-left px-3 py-2 rounded border text-sm ${selectedKpiChart === opt ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">{selectedKpiChart}</div>
            <div className="min-h-[180px] flex items-center justify-center">
              <DynamicMockChart kpi={selectedKpiChart} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Filters({ filters, setFilters }: { filters: FilterState; setFilters: (f: FilterState) => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
      <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        {['Last 7 days', 'Last 30 days', 'Last 90 days', 'This Year'].map(dr => (<option key={dr} value={dr}>{dr}</option>))}
      </select>
      <select value={filters.team} onChange={(e) => setFilters({ ...filters, team: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        {mockTeam.map(t => (<option key={t} value={t}>{t}</option>))}
      </select>
      <select value={filters.service} onChange={(e) => setFilters({ ...filters, service: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        {mockServices.map(s => (<option key={s} value={s}>{s}</option>))}
      </select>
      <Button variant="outline" onClick={() => setFilters({ dateRange: 'Last 30 days', team: 'All', service: 'All' })}>Reset</Button>
    </div>
  )
}

function KpiRow({ kpis }: { kpis: { revenue: string; jobs: string; utilization: string; avgPayout: string; avgRevenue: string } }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Kpi label="Revenue Earned" value={kpis.revenue} />
      <Kpi label="Jobs Performed" value={kpis.jobs} />
      <Kpi label="Workforce Utilization" value={kpis.utilization} />
      <Kpi label="Avg Payout / Job" value={kpis.avgPayout} />
      <Kpi label="Avg Revenue / Job" value={kpis.avgRevenue} />
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
      <div className="min-h-[180px] flex items-center justify-center">{children}</div>
    </div>
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

function MockLineChart() {
  return (
    <svg className="w-full h-40 text-blue-600" viewBox="0 0 400 160" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="3" points="0,120 50,110 100,90 150,95 200,70 250,80 300,60 350,65 400,50" />
      <line x1="0" y1="140" x2="400" y2="140" stroke="#E5E7EB" />
    </svg>
  )
}

function MockAreaChart() {
  return (
    <svg className="w-full h-40 text-indigo-500" viewBox="0 0 400 160" preserveAspectRatio="none">
      <polyline fill="rgba(99,102,241,0.2)" stroke="currentColor" strokeWidth="2" points="0,130 50,120 100,115 150,100 200,85 250,90 300,70 350,80 400,60 400,160 0,160" />
      <line x1="0" y1="140" x2="400" y2="140" stroke="#E5E7EB" />
    </svg>
  )
}

function MockBarsLabeled({ labels, values }: { labels: string[]; values: number[] }) {
  const max = Math.max(...values, 1)
  return (
    <div className="w-full">
      <div className="flex items-end gap-3 h-40">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-blue-600 rounded" style={{ height: `${(v / max) * 100}%` }} />
            <div className="mt-1 text-xs text-gray-600 truncate w-full text-center">{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DynamicMockChart({ kpi }: { kpi: KpiChartKey }) {
  switch (kpi) {
    case 'Revenue Over Time':
      return <MockLineChart />
    case 'Jobs Per Team Member':
      return <MockBarsLabeled labels={["Alice","Bob","Chris","Dana","Evan"]} values={[52,71,38,45,60]} />
    case 'Workforce Utilization':
      return <MockAreaChart />
    case 'Product Usage':
      return <MockBarsLabeled labels={["Scheduling","Forms","Payments","Reports","Chat"]} values={[80,55,42,30,24]} />
    case 'Avg Revenue / Job':
      return <MockLineChart />
    case 'Avg Payout / Job':
      return <MockLineChart />
    case 'Jobs / Day':
      return <MockBarsLabeled labels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]} values={[55,62,58,70,66,40,35]} />
    case 'Jobs / Service Type':
      return <MockBarsLabeled labels={["Move","Clean","Install","Other"]} values={[140,120,90,36]} />
    case 'Technician Hours':
      return <MockAreaChart />
    case 'Conversion Rate':
      return <MockLineChart />
    default:
      return <MockLineChart />
  }
}


