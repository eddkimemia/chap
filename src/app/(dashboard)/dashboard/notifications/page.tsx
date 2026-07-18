'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  MessageSquare,
  Star,
  AlertTriangle,
  CreditCard,
  User,
  Check,
  CheckCheck,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  link?: string
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  message: { icon: MessageSquare, color: 'text-royal', bg: 'bg-blue-50' },
  listing: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  payment: { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  user: { icon: User, color: 'text-accent-purple', bg: 'bg-purple-50' },
  default: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notifications')
      if (res.ok) {
      const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch { toast.error('Failed to load notifications') } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    try {
      await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      })
    } catch { toast.error('Failed to mark as read') }
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await apiFetch('/api/notifications/read-all', {
        method: 'PUT',
      })
      toast.success('All marked as read')
    } catch { toast.error('Failed to mark all as read') }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-xl">
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
          </div>
        ) : notifications.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bell className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-navy">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up!</p>
          </CardContent>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => {
      const config = typeConfig[notif.type] || typeConfig.default
      const Icon = config.icon
              return (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id)
                    if (notif.link) router.push(notif.link)
                  }}
                  className={`w-full flex items-start gap-4 p-4 text-left transition-colors hover:bg-muted/30 ${
                    !notif.read ? 'bg-royal/[0.02]' : ''
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${notif.read ? 'text-navy/70' : 'text-navy'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-royal shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${notif.read ? 'text-muted-foreground' : 'text-navy/70'}`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {notif.read && (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
