'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus, Eye, MessageSquare, Heart, TrendingUp, ArrowRight,
  DollarSign, List, BarChart3, Package, ShoppingCart, HelpCircle,
  Bell, AlertCircle, CheckCircle, XCircle, Building2, UserCheck, Zap,
  Megaphone, Sparkles, Shield, AlertTriangle, PartyPopper,
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
  const [fullUser, setFullUser] = useState<any>(null)
  const { currentUser } = useAppStore()

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const isNewUser = stats && stats.totalListings === 0
  const needsIdentityVerification = fullUser && !fullUser.isVerified

  useEffect(() => {
    Promise.all([
      apiFetch('/api/analytics/overview').then(r => r.ok ? r.json() : null),
      apiFetch('/api/listings?mine=true&limit=5').then(r => r.ok ? r.json().then((d: any) => d.listings || d) : []),
      apiFetch('/api/messages?limit=5').then(r => r.ok ? r.json() : { messages: [] }),
      apiFetch('/api/notifications').then(r => r.ok ? r.json() : []),
      apiFetch('/api/auth/me').then(r => r.ok ? r.json().then((d: any) => d.user) : null),
    ]).then(([s, listingsData, messagesData, notifData, userData]) => {
      setStats(s)
      setRecentListings(listingsData || [])
      setRecentMessages(messagesData?.messages || messagesData || [])
      setNotifications(Array.isArray(notifData) ? notifData.slice(0, 5) : notifData?.notifications?.slice(0, 5) || [])
      setFullUser(userData)
    }).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false))
  }, [])

  const welcomeSubtitle = useMemo(() => {
    if (!fullUser || !stats) return "Here's what's happening with your marketplace today."
    if (isNewUser && needsIdentityVerification) return 'Get started — verify your account and post your first ad to reach thousands of buyers!'
    if (isNewUser) return 'Ready to start selling? Post your first ad and reach thousands of buyers!'
    if (needsIdentityVerification) return 'Verify your identity to unlock all selling features and build buyer trust.'
    return "Here's what's happening with your marketplace today."
  }, [fullUser, stats, isNewUser, needsIdentityVerification])

  const promptAction = useMemo(() => {
    if (!fullUser || !stats) return null
    if (isNewUser && needsIdentityVerification) return { label: 'Verify & Post', href: '/sell', icon: Shield }
    if (isNewUser) return { label: 'Post Your First Ad', href: '/sell', icon: Megaphone }
    if (needsIdentityVerification) return { label: 'Verify Identity', href: '/verify-identity', icon: Shield }
    return null
  }, [fullUser, stats, isNewUser, needsIdentityVerification])

  const statCards = stats ? [
    { label: 'Listings', value: String(stats.totalListings), sub: `${stats.activeListings} active`, icon: Package, color: 'text-royal', bg: 'bg-royal/10' },
    { label: 'Views', value: stats.totalViews.toLocaleString(), sub: `+${stats.recentViews} this week`, icon: Eye, color: 'text-electric', bg: 'bg-electric/10' },
    { label: 'Messages', value: String(stats.totalMessages), sub: `${stats.unreadMessages} unread`, icon: MessageSquare, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { label: 'Favorites', value: String(stats.totalFavorites), sub: `${stats.totalReviews} reviews`, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Sales', value: String(stats.totalSales), sub: `${stats.avgRating.toFixed(1)} rating`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Profile Views', value: stats.profileViews.toLocaleString(), sub: `${stats.totalLeads} leads`, icon: UserCheck, color: 'text-accent-red', bg: 'bg-accent-red/10' },
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
    { label: 'Post Ad', icon: Megaphone, href: '/sell', color: 'bg-royal text-white', desc: 'New listing' },
    { label: 'Listings', icon: List, href: '/dashboard/listings', color: 'bg-electric text-white', desc: 'Manage' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', color: 'bg-accent-purple text-white', desc: `${stats?.unreadMessages || 0} unread` },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics', color: 'bg-emerald-500 text-white', desc: 'Performance' },
    { label: 'Profile', icon: Building2, href: '/dashboard/settings', color: 'bg-accent-red text-white', desc: 'Settings' },
    { label: 'Help', icon: HelpCircle, href: '/dashboard/support', color: 'bg-slate-600 text-white', desc: 'Support' },
  ]

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-navy via-navy/95 to-royal/80 p-4 sm:p-5">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {timeGreeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
              {isNewUser && <PartyPopper className="h-4 w-4 text-amber-300" />}
            </h1>
            <p className="text-white/60 text-xs sm:text-sm mt-0.5 max-w-lg">
              {welcomeSubtitle}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link href={`/seller/${currentUser?.username || currentUser?.id}`} className="text-[10px] text-white/40 hover:text-white/70 transition-colors font-mono">
                @{currentUser?.username || 'username'}
              </Link>
              {fullUser && (
                <>
                  <span className="text-white/20">·</span>
                  {fullUser.isVerified ? (
                    <span className="text-[10px] text-emerald-300 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <Link href="/verify-identity" className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Unverified
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {promptAction && (
              <Button size="sm" className="rounded-lg bg-white text-navy hover:bg-white/90 border-0 h-9 px-4 text-xs font-bold shadow-lg" asChild>
                <Link href={promptAction.href}>
                  <promptAction.icon className="h-3.5 w-3.5 mr-1" />
                  {promptAction.label}
                </Link>
              </Button>
            )}
            <Button size="sm" className="rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/10 h-9 px-3 text-xs" asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bg} mb-2`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
              <p className="text-base font-bold text-navy">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{stat.label}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Active', count: stats.activeListings, color: 'bg-emerald-500' },
            { label: 'Pending', count: stats.pendingListings, color: 'bg-amber-500' },
            { label: 'Sold', count: stats.soldListings, color: 'bg-blue-500' },
            { label: 'Expired', count: stats.expiredListings, color: 'bg-red-500' },
          ].filter(s => s.count > 0).map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-slate-100 shadow-sm">
              <div className={`h-2 w-2 rounded-full ${s.color}`} />
              <span className="text-xs font-semibold text-navy">{s.count}</span>
              <span className="text-[10px] text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
              <CardTitle className="text-sm font-bold text-navy flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-royal" /> Recent Listings
              </CardTitle>
              <Link href="/dashboard/listings" className="text-[10px] text-royal font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {loading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
              ) : recentListings.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <Package className="h-8 w-8 mx-auto mb-1.5 text-slate-200" />
                  <p className="text-xs">No listings yet.</p>
                  <Button size="sm" className="mt-2 rounded-lg bg-royal border-0 h-8 text-xs" asChild>
                    <Link href="/sell"><Plus className="h-3 w-3 mr-1" /> Post New Ad</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentListings.map((listing) => (
                    <Link key={listing.id} href={`/dashboard/listings/${listing.id}/edit`}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {listing.images?.length ? (
                          <img src={listing.images[0]?.url} alt={listing.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-navy truncate group-hover:text-royal transition-colors">{listing.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-navy">{formatPrice(listing.price)}</span>
                          <Badge className={`text-[8px] px-1 py-0 rounded font-medium border ${statusColors[listing.status] || statusColors.draft}`}>
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-slate-400">{listing.views} views</p>
                        <p className="text-[9px] text-slate-400">{timeAgo(listing.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
              <CardTitle className="text-sm font-bold text-navy flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-accent-purple" /> Recent Messages
              </CardTitle>
              <Link href="/dashboard/messages" className="text-[10px] text-royal font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {loading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
              ) : recentMessages.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <MessageSquare className="h-8 w-8 mx-auto mb-1.5 text-slate-200" />
                  <p className="text-xs">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentMessages.slice(0, 5).map((msg) => (
                    <Link key={msg.id} href={`/dashboard/messages?conversation=${msg.conversationId}`}
                      className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors hover:bg-slate-50 ${!msg.isRead ? 'bg-royal/5' : ''}`}>
                      <div className="h-8 w-8 rounded-lg bg-royal/10 shrink-0 flex items-center justify-center text-royal font-semibold text-xs">
                        {msg.sender?.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs truncate ${!msg.isRead ? 'font-bold text-navy' : 'font-medium text-navy'}`}>{msg.sender?.name}</p>
                          {!msg.isRead && <div className="h-1.5 w-1.5 rounded-full bg-royal shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">{timeAgo(msg.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm font-bold text-navy flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-accent-red" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="grid grid-cols-2 gap-1.5">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}
                    className={`${action.color} rounded-lg p-2.5 text-center hover:opacity-90 transition-all`}>
                    <action.icon className="h-4 w-4 mx-auto mb-0.5" />
                    <p className="text-[10px] font-semibold leading-tight">{action.label}</p>
                    <p className="text-[8px] opacity-70 mt-0.5 leading-tight">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
              <CardTitle className="text-sm font-bold text-navy flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-accent-red" /> Notifications
              </CardTitle>
              <Link href="/dashboard/notifications" className="text-[10px] text-royal font-semibold hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-1">
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  <Bell className="h-6 w-6 mx-auto mb-1 text-slate-200" />
                  <p className="text-[10px]">No notifications</p>
                </div>
              ) : (
                notifications.map((n: any) => (
                  <Link key={n.id} href="/dashboard/notifications"
                    className={`flex items-start gap-2 p-2 rounded-lg transition-colors hover:bg-slate-50 ${!n.isRead ? 'bg-royal/5' : ''}`}>
                    <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-royal'}`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-navy truncate">{n.title}</p>
                      <p className="text-[9px] text-slate-400 line-clamp-1">{n.body}</p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-amber-200/60 bg-amber-50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-amber-800 mb-0.5">Quick Tip</p>
                  <p className="text-[9px] text-amber-700/80 leading-relaxed">
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
