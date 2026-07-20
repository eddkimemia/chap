'use client'

import { useState, useEffect } from 'react'
import { Users, List, DollarSign, AlertTriangle, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts'

import { apiFetch } from '@/lib/api-client'

interface AnalyticsData {
  users: { total: number; activeLast30d: number; new30d: number }
  listings: { total: number; active: number; new30d: number }
  revenue: { total: number; monthly30d: number; monthlyBreakdown: Record<string, number> }
  reports: { total: number; pending: number }
  messaging: { conversations: number; messages: number }
  topCategories: { categoryId: string; _count: number }[]
  topLocations: { locationId: string; _count: number }[]
}

const COLORS = ['#2563eb', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6', '#f59e0b', '#ec4899', '#6366f1', '#84cc16']

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
      const res = await apiFetch('/api/admin/analytics')
        if (res.ok) setData(await res.json())
      } catch {} finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const revenueChart = data?.revenue.monthlyBreakdown
    ? Object.entries(data.revenue.monthlyBreakdown).map(([month, revenue]) => ({ month, revenue }))
    : []

  const categoryChart = data?.topCategories?.map((c) => ({ name: c.categoryId?.slice(0, 8) || 'Unknown', value: c._count })) || []
  const locationChart = data?.topLocations?.map((l) => ({ name: l.locationId?.slice(0, 8) || 'Unknown', value: l._count })) || []

  const statCards = [
    { title: 'Total Users', value: data?.users.total ?? 0, sub: `${data?.users.activeLast30d ?? 0} active in 30d`, icon: Users, color: 'bg-royal' },
    { title: 'Total Listings', value: data?.listings.total ?? 0, sub: `${data?.listings.active ?? 0} active`, icon: List, color: 'bg-accent-red' },
    { title: 'Revenue (KES)', value: `KES ${(data?.revenue.total ?? 0).toLocaleString()}`, sub: `KES ${(data?.revenue.monthly30d ?? 0).toLocaleString()} this month`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'Reports', value: data?.reports.total ?? 0, sub: `${data?.reports.pending ?? 0} pending`, icon: AlertTriangle, color: 'bg-red-500' },
    { title: 'Messaging', value: data?.messaging.messages ?? 0, sub: `${data?.messaging.conversations ?? 0} conversations`, icon: MessageSquare, color: 'bg-accent-purple' },
    { title: 'New Users (30d)', value: data?.users.new30d ?? 0, sub: `${data?.listings.new30d ?? 0} new listings`, icon: TrendingUp, color: 'bg-cyan-500' },
  ]

  return (
    <div className="space-y-6 lg:pl-6">
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide metrics and insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => (
          <Card key={i} className="rounded-2xl border-0 shadow-premium"><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
        )) : statCards.map((s) => (
          <Card key={s.title} className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.title}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color} text-white`}><s.icon className="h-4 w-4" /></div>
              </div>
              <p className="text-lg font-bold text-navy">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader><CardTitle className="text-navy text-lg font-bold">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[250px]" /> : revenueChart.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No revenue data</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueChart}>
                  <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(v: number) => [`KES ${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader><CardTitle className="text-navy text-lg font-bold">Top Categories</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[250px]" /> : categoryChart.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No category data</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryChart} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                    {categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader><CardTitle className="text-navy text-lg font-bold">Top Locations</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[200px]" /> : locationChart.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No location data</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={locationChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader><CardTitle className="text-navy text-lg font-bold">Platform Health</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
              <div className="space-y-4">
                {[
                  { label: 'Active Users Rate', value: data ? `${Math.round((data.users.activeLast30d / Math.max(data.users.total, 1)) * 100)}%` : '0%', color: 'bg-royal' },
                  { label: 'Active Listings Rate', value: data ? `${Math.round((data.listings.active / Math.max(data.listings.total, 1)) * 100)}%` : '0%', color: 'bg-emerald-500' },
                  { label: 'Resolved Reports', value: data ? `${Math.round(((data.reports.total - data.reports.pending) / Math.max(data.reports.total, 1)) * 100)}%` : '0%', color: 'bg-accent-red' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-navy font-medium">{item.label}</span><span className="text-muted-foreground font-semibold">{item.value}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-royal/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Conversations</p>
                    <p className="text-lg font-bold text-navy">{data?.messaging.conversations?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-accent-red/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Messages</p>
                    <p className="text-lg font-bold text-navy">{data?.messaging.messages?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
