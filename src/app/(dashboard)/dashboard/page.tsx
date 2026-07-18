'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus, Eye, MessageSquare, Heart, TrendingUp, ArrowRight, Star, Clock,
  DollarSign, List, BarChart3, Package, ShoppingCart, HelpCircle,
  Bell, AlertCircle, CheckCircle, XCircle, Building2, UserCheck, Zap,
  Megaphone, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, timeAgo } from '@/lib/format'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'

import { apiFetch } from '@/lib/api-client'

interface DashboardStats {
  totalListings: number; activeListings: number; pendingListings: number
  soldListings: number; expiredListings: number
  totalViews: number; recentViews: number
  totalMessages: number; unreadMessages: number
  totalFavorites: number; totalReviews: number
  profileViews: number; totalLeads: number
  totalSales: number; avgRating: number
  viewsPerDay: { date: string; views: number }[]
}

interface RecentListing {
  id: string; title: string; price: number; currency: string; status: string
  images: { url: string }[]; createdAt: string; isFeatured: boolean; views: number
}

interface RecentMessage {
  id: string; content: string; createdAt: string; isRead: boolean
  sender: { id: string; name: string; avatar: string | null }
  conversationId: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentListings, setRecentListings] = useState<RecentListing[]>([])
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAppStore()

  useEffect(() => {
    Promise.all([
      apiFetch('/api/analytics/overview').then(r => r.ok ? r.json() : null),
      apiFetch('/api/listings?mine=true&limit=5').then(r => r.ok ? r.json().then((d: any) => d.listings || d) : []),
      apiFetch('/api/messages?limit=5').then(r => r.ok ? r.json() : { messages: [] }),
      apiFetch('/api/notifications').then(r => r.ok ? r.json() : []),
    ]).then(([s, listingsData, messagesData, notifData]) => {
      setStats(s)
      setRecentListings(listingsData || [])
      setRecentMessages(messagesData?.messages || messagesData || [])
      setNotifications(Array.isArray(notifData) ? notifData.slice(0, 5) : notifData?.notifications?.slice(0, 5) || [])
    }).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { label: 'Total Listings', value: String(stats.totalListings), sub: `${stats.activeListings} active`, icon: Package, color: 'text-royal', bg: 'bg-royal/5' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: `+${stats.recentViews} this week`, icon: Eye, color: 'text-electric', bg: 'bg-electric/5' },
    { label: 'Messages', value: String(stats.totalMessages), sub: `${stats.unreadMessages} unread`, icon: MessageSquare, color: 'text-accent-purple', bg: 'bg-accent-purple/5' },
    { label: 'Favorites', value: String(stats.totalFavorites), sub: `${stats.totalReviews} reviews`, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Sales', value: String(stats.totalSales), sub: `${stats.avgRating.toFixed(1)} avg rating`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Profile Views', value: stats.profileViews.toLocaleString(), sub: `${stats.totalLeads} leads`, icon: UserCheck, color: 'text-accent-orange', bg: 'bg-accent-orange/5' },
  ] : []

  const statusColors: Record<string, string> = {
    active: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    draft: 'text-slate-600 bg-slate-50 border-slate-200',
    sold: 'text-blue-600 bg-blue-50 border-blue-200',
    expired: 'text-red-600 bg-red-50 border-red-200',
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    suspended: 'text-red-600 bg-red-50 border-red-200',
  }

  const quickActions = [
    { label: 'Post New Ad', icon: Megaphone, href: '/dashboard/listings/new', color: 'bg-gradient-to-br from-royal to-royal/80 text-white row-span-2', desc: 'Create a new listing', big: true },
    { label: 'My Listings', icon: List, href: '/dashboard/listings', color: 'bg-electric text-white', desc: 'Manage your listings' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', color: 'bg-accent-purple text-white', desc: `${stats?.unreadMessages || 0} unread` },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics', color: 'bg-emerald-500 text-white', desc: 'View performance' },
    { label: 'Profile', icon: Building2, href: '/dashboard/settings', color: 'bg-accent-orange text-white', desc: 'Edit your profile' },
    { label: 'Help Center', icon: HelpCircle, href: '/dashboard/support', color: 'bg-slate-600 text-white', desc: 'Get support' },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-navy via-navy/95 to-royal/90 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-white/60 mt-1.5 text-sm sm:text-base max-w-xl">
              Here&apos;s what&apos;s happening with your marketplace today.
            </p>
          </div>
          <Button size="lg" className="rounded-2xl bg-white text-navy hover:bg-white/90 hover:shadow-xl hover:shadow-white/20 border-0 h-14 px-8 gap-3 text-base font-bold shrink-0 shadow-lg shadow-black/10" asChild>
            <Link href="/dashboard/listings/new">
              <Megaphone className="h-6 w-6 text-royal" />
              Post New Ad
              <Sparkles className="h-4 w-4 text-amber-500" />
            </Link>
          </Button>
        </div>
        <div className="absolute right-0 top-0 w-48 h-48 opacity-5">
          <div className="absolute right-8 top-8 w-32 h-32 rounded-full bg-white" />
          <div className="absolute right-20 top-4 w-16 h-16 rounded-full bg-white/50" />
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white border border-slate-100 p-4 shadow-premium hover:shadow-premium-lg transition-all">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-navy">{stat.value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status Breakdown */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Active', count: stats.activeListings, color: 'bg-emerald-500' },
            { label: 'Pending', count: stats.pendingListings, color: 'bg-amber-500' },
            { label: 'Sold', count: stats.soldListings, color: 'bg-blue-500' },
            { label: 'Expired', count: stats.expiredListings, color: 'bg-red-500' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-slate-100 shadow-sm">
              <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
              <span className="text-sm font-semibold text-navy">{s.count}</span>
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                <Package className="h-4 w-4 text-royal" /> Recent Listings
              </CardTitle>
              <Link href="/dashboard/listings" className="text-xs text-royal font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : recentListings.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Package className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">No listings yet. Post your first ad!</p>
                  <Button size="sm" className="mt-3 rounded-xl bg-royal border-0" asChild>
                    <Link href="/dashboard/listings/new"><Plus className="h-3.5 w-3.5 mr-1" /> Post New Ad</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentListings.map((listing) => (
                    <Link key={listing.id} href={`/dashboard/listings/${listing.id}/edit`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {listing.images?.length ? (
                          <img src={listing.images[0]?.url} alt={listing.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-navy truncate group-hover:text-royal transition-colors">{listing.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-navy">{formatPrice(listing.price)}</span>
                          <Badge className={`text-[9px] px-1.5 py-0 rounded-md font-medium border ${statusColors[listing.status] || statusColors.draft}`}>
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-400">{listing.views} views</p>
                        <p className="text-[10px] text-slate-400">{timeAgo(listing.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent-purple" /> Recent Messages
              </CardTitle>
              <Link href="/dashboard/messages" className="text-xs text-royal font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : recentMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentMessages.slice(0, 5).map((msg) => (
                    <Link key={msg.id} href={`/dashboard/messages?conversation=${msg.conversationId}`}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-slate-50 ${!msg.isRead ? 'bg-royal/5' : ''}`}>
                      <div className="h-10 w-10 rounded-xl bg-royal/10 shrink-0 flex items-center justify-center text-royal font-semibold text-sm">
                        {msg.sender?.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!msg.isRead ? 'font-bold text-navy' : 'font-medium text-navy'}`}>{msg.sender?.name}</p>
                          {!msg.isRead && <div className="h-2 w-2 rounded-full bg-royal shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(msg.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent-orange" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}
                  className={`${action.color} rounded-xl p-3 ${action.big ? 'p-5' : ''} text-center hover:opacity-90 transition-all ${action.big ? 'col-span-2' : ''}`}>
                  <action.icon className={`${action.big ? 'h-7 w-7' : 'h-5 w-5'} mx-auto mb-1`} />
                  <p className={`${action.big ? 'text-base' : 'text-[11px]'} font-semibold`}>{action.label}</p>
                  <p className={`${action.big ? 'text-xs' : 'text-[9px]'} opacity-70 mt-0.5`}>{action.desc}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent-orange" /> Notifications
              </CardTitle>
              <Link href="/dashboard/notifications" className="text-xs text-royal font-semibold hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)
              ) : notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-1 text-slate-200" />
                  <p className="text-xs">No notifications</p>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <Link key={n.id} href="/dashboard/notifications"
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors hover:bg-slate-50 ${!n.isRead ? 'bg-royal/5' : ''}`}>
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-royal'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-navy truncate">{n.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{n.body}</p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="rounded-2xl border border-amber-200/60 bg-amber-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 mb-0.5">Quick Tip</p>
                  <p className="text-[10px] text-amber-700/80 leading-relaxed">
                    Keep your listings fresh! Renew expired listings and add new photos to attract more buyers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
