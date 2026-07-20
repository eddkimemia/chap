'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  List,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Activity,
  UserPlus,
  FileText,
  CreditCard,
  Globe,
  Settings2,
  UserCog,
  ClipboardList,
  BarChart3,
  BookOpen,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

import { apiFetch } from '@/lib/api-client'

interface AdminStats {
  totalUsers: number
  newListings: number
  totalRevenue: number
  openReports: number
  monthlyGrowth: number
}

interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  user?: string
}

const revenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 5800 },
  { month: 'Mar', revenue: 6200 },
  { month: 'Apr', revenue: 7100 },
  { month: 'May', revenue: 8400 },
  { month: 'Jun', revenue: 9200 },
  { month: 'Jul', revenue: 10800 },
]

const listingsData = [
  { month: 'Jan', listings: 120 },
  { month: 'Feb', listings: 180 },
  { month: 'Mar', listings: 240 },
  { month: 'Apr', listings: 310 },
  { month: 'May', listings: 380 },
  { month: 'Jun', listings: 450 },
  { month: 'Jul', listings: 520 },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
      const [statsRes, activityRes] = await Promise.allSettled([
          apiFetch('/api/admin/stats'),
          apiFetch('/api/admin/activity'),
        ])

        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          setStats(await statsRes.value.json())
        }
        if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
          setActivity(await activityRes.value.json())
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-royal', href: '/admin/users' },
    { title: 'Active Listings', value: stats?.newListings ?? 0, icon: List, color: 'bg-accent-red', href: '/admin/listings' },
    { title: 'Revenue (KES)', value: `KES ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', href: '/admin/payments' },
    { title: 'Open Reports', value: stats?.openReports ?? 0, icon: AlertTriangle, color: 'bg-red-500', href: '/admin/reports' },
  ]

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview of your platform</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Users className="h-4 w-4 mr-1" /> Users
              </Button>
            </Link>
            <Link href="/admin/listings">
              <Button size="sm" className="rounded-xl bg-royal text-white border-0">
                <List className="h-4 w-4 mr-1" /> Listings
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick nav header */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Reports', icon: AlertTriangle, href: '/admin/reports', color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' },
            { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
            { label: 'CMS Pages', icon: BookOpen, href: '/admin/cms', color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
            { label: 'Maintenance', icon: Database, href: '/admin/maintenance', color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100' },
            { label: 'Roles', icon: UserCog, href: '/admin/roles', color: 'text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100' },
            { label: 'Settings', icon: Settings2, href: '/admin/settings', color: 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100' },
            { label: 'SEO', icon: Globe, href: '/admin/seo', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
            { label: 'Audit Logs', icon: ClipboardList, href: '/admin/audit-logs', color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-xl border text-xs font-semibold ${item.color}`}
              >
                <item.icon className="h-3.5 w-3.5 mr-1.5" /> {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="rounded-2xl border-0 shadow-premium">
                  <CardContent className="p-5"><Skeleton className="h-20" /></CardContent>
                </Card>
              ))
          : statCards.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="rounded-2xl border-0 shadow-premium card-hover cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                        <p className="text-xl font-bold text-navy mt-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-white shadow-lg`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-base font-bold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(v: number) => [`KES ${v.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-navy text-base font-bold">New Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={listingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="listings" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="text-navy text-base font-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/30">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-navy">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="text-navy text-base font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'text-royal' },
                { label: 'Manage Listings', icon: List, href: '/admin/listings', color: 'text-accent-red' },
                { label: 'View Reports', icon: AlertTriangle, href: '/admin/reports', color: 'text-red-500' },
                { label: 'Payments', icon: CreditCard, href: '/admin/payments', color: 'text-emerald-600' },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button variant="outline" className="w-full h-auto flex-col gap-2 py-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-royal/30 hover:bg-royal/5 transition-all">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-xs font-medium text-navy">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
