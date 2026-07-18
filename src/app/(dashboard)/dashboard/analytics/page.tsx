'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, TrendingDown, Eye, MessageSquare, Heart, DollarSign,
  ShoppingCart, Users, Calendar, Download, ChevronDown, BarChart3,
  Package, Star, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/format'

import { apiFetch } from '@/lib/api-client'

interface OverviewData {
  totalListings: number; activeListings: number; totalViews: number
  totalMessages: number; totalFavorites: number; totalSales: number
  averageRating: number; profileViews: number
  viewsChange: number; messagesChange: number; favoritesChange: number; salesChange: number
  dailyViews: { date: string; count: number }[]
  topCategories: { name: string; count: number }[]
  recentActivity: { type: string; message: string; date: string }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [activeChart, setActiveChart] = useState<'views' | 'messages' | 'favorites' | 'sales'>('views')
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch(`/api/analytics/overview?period=${period}`)
      if (res.ok) setData(await res.json())
    } catch { toast.error('Failed to load analytics') } finally { setLoading(false) }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const downloadCSV = () => {
    if (!data?.dailyViews) return
    const csv = 'Date,Views\n' + data.dailyViews.map(d => `${d.date},${d.count}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `analytics-${period}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Views', value: data?.totalViews?.toLocaleString() || '0', icon: Eye, change: data?.viewsChange, color: 'blue' },
    { label: 'Active Listings', value: data?.activeListings?.toString() || '0', icon: Package, color: 'emerald' },
    { label: 'Messages', value: data?.totalMessages?.toLocaleString() || '0', icon: MessageSquare, change: data?.messagesChange, color: 'violet' },
    { label: 'Favorites', value: data?.totalFavorites?.toLocaleString() || '0', icon: Heart, change: data?.favoritesChange, color: 'rose' },
    { label: 'Sales', value: data?.totalSales?.toString() || '0', icon: ShoppingCart, change: data?.salesChange, color: 'amber' },
    { label: 'Avg. Rating', value: data?.averageRating?.toFixed(1) || '0.0', icon: Star, color: 'amber' },
    { label: 'Profile Views', value: data?.profileViews?.toLocaleString() || '0', icon: Users, color: 'cyan' },
    { label: 'Total Listings', value: data?.totalListings?.toString() || '0', icon: Package, color: 'slate' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Track your performance and growth</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-10 w-32 rounded-xl bg-white border-slate-200 text-sm">
              <Calendar className="h-3.5 w-3.5 mr-1" /><SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadCSV} className="h-10 rounded-xl gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
      const colorMap: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600',
            violet: 'bg-violet-50 text-violet-600', rose: 'bg-rose-50 text-rose-600',
            amber: 'bg-amber-50 text-amber-600', cyan: 'bg-cyan-50 text-cyan-600',
            slate: 'bg-slate-50 text-slate-600',
          }
          return (
            <Card key={stat.label} className="rounded-2xl border-0 shadow-premium card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl ${colorMap[stat.color] || colorMap.slate} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  {stat.change !== undefined && (
                    <Badge className={`text-[10px] rounded-lg border-0 ${stat.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {stat.change >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5 inline" /> : <TrendingDown className="h-3 w-3 mr-0.5 inline" />}
                      {Math.abs(stat.change)}%
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-navy mt-3">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Chart / Activity / Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Views Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-0 shadow-premium">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-navy">Daily Activity</CardTitle>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-0.5">
                {(['views', 'messages', 'favorites', 'sales'] as const).map((key) => (
                  <button key={key} onClick={() => setActiveChart(key)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all capitalize ${activeChart === key ? 'bg-white text-navy shadow-sm' : 'text-slate-400 hover:text-navy'}`}>
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data?.dailyViews?.length ? (
              <div className="h-48 flex items-end gap-1">
                {data.dailyViews.slice(-30).map((d, i) => {
      const max = Math.max(...data.dailyViews.map(x => x.count), 1)
      const h = (d.count / max) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div className="w-full bg-royal/10 rounded-t-sm relative" style={{ height: `${Math.max(h, 2)}%` }}>
                        <div className="absolute inset-0 bg-royal rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {d.count} {activeChart}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-300">
                <BarChart3 className="h-12 w-12" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Categories */}
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-navy">Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.topCategories?.length ? data.topCategories.slice(0, 6).map((cat, i) => {
      const max = Math.max(...data.topCategories.map(c => c.count), 1)
      const pct = (cat.count / max) * 100
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-navy font-medium truncate">{cat.name}</span>
                        <span className="text-slate-400">{cat.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-royal rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-sm text-slate-400 text-center py-4">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-navy">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {data?.recentActivity?.length ? data.recentActivity.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                    act.type === 'view' ? 'bg-blue-50 text-blue-500' :
                    act.type === 'message' ? 'bg-violet-50 text-violet-500' :
                    act.type === 'favorite' ? 'bg-rose-50 text-rose-500' :
                    act.type === 'sale' ? 'bg-emerald-50 text-emerald-500' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-600 truncate">{act.message}</p>
                    <p className="text-[10px] text-slate-400">{act.date}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
