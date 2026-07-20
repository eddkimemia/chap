'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  FileText,
  CreditCard,
  FolderTree,
  MapPin,
  CreditCard as CreditCardIcon,
  Megaphone,
  PenTool,
  LayoutDashboard,
  LogOut,
  Menu,
  ChevronRight,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/api-client'

interface User {
  id: string; name: string; email?: string; phone?: string; avatar?: string; role: string
}

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/listings', label: 'Listings', icon: FileText },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/plans', label: 'Plans', icon: CreditCardIcon },
  { href: '/admin/advertisements', label: 'Adverts', icon: Megaphone },
  { href: '/admin/blog', label: 'Blog', icon: PenTool },
]

function AdminSidebar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-navy to-navy/95 overflow-hidden">
      <div className="p-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img src="/logoicon.png" alt="ChapKE" className="h-10 w-10 rounded-xl object-cover" />
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              Chap<span className="text-blue-400">KE</span>
            </span>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Admin Panel</p>
          </div>
        </Link>
      </div>

      {user && (
        <div className="mx-4 mb-4 rounded-2xl bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-blue-600 text-white font-semibold text-sm">
              {user.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-white/40 truncate">Administrator</p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        <p className="px-3 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          Administration
        </p>
        <nav className="space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500/20 to-blue-600/20 text-white shadow-sm border-l-2 border-red-500'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-blue-400' : ''}`} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-white/30" />}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4 bg-white/10" />

        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Home className="h-[18px] w-[18px]" />
          Back to Site
        </Link>
      </ScrollArea>

      <div className="p-3">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { setCurrentUser, logout, clearLegacyAuthStorage } = useAppStore()

  useEffect(() => {
    let cancelled = false
    clearLegacyAuthStorage()

    apiFetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        if (data?.user) {
          if (data.user.role !== 'admin') {
            router.push('/dashboard')
            return
          }
          setUser(data.user)
          setCurrentUser(data.user)
          setLoading(false)
        } else {
          router.push('/admin/login')
        }
      })
      .catch(() => {
        if (!cancelled) router.push('/admin/login')
      })

    return () => { cancelled = true }
  }, [router, setCurrentUser, clearLegacyAuthStorage])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy">
        <div className="h-8 w-8 border-3 border-red-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 h-screen">
        <AdminSidebar user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm shadow-premium"
          >
            <Menu className="h-5 w-5 text-navy" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-0">
          <AdminSidebar user={user} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 lg:pl-0" style={{ zoom: 0.88 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
