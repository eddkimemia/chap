'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  List,
  MessageSquare,
  Heart,
  Bell,
  Settings,
  LogOut,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  CreditCard,
  PenTool,
  Menu,
  X,
  ChevronRight,
  Search,
  Bookmark,
  Star,
  BarChart3,
  Crown,
  HelpCircle,
  UserCheck,
  FolderTree,
  MapPin,
  CreditCard as CreditCardIcon,
  Megaphone,
  BookOpen,
  Globe,
  Settings2,
  UserCog,
  ClipboardList,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/api-client'

interface User {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  role: string
}

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/listings', label: 'My Listings', icon: List },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/orders', label: 'Premium Plans', icon: Crown },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/support', label: 'Help & Support', icon: HelpCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: Shield },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/listings', label: 'Listings', icon: FileText },
  { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/plans', label: 'Plans', icon: CreditCardIcon },
  { href: '/admin/advertisements', label: 'Adverts', icon: Megaphone },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/cms', label: 'CMS Pages', icon: BookOpen },
  { href: '/admin/blog', label: 'Blog', icon: PenTool },
  { href: '/admin/seo', label: 'SEO', icon: Globe },
  { href: '/admin/settings', label: 'Settings', icon: Settings2 },
  { href: '/admin/roles', label: 'Roles', icon: UserCog },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { href: '/admin/maintenance', label: 'Maintenance', icon: Database },
]

function SidebarContent({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const pathname = usePathname()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex h-full flex-col bg-navy">
      <div className="p-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal text-white font-bold text-base shadow-lg shadow-royal/30">
            C
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              Chap<span className="text-electric-light">KE</span>
            </span>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Dashboard</p>
          </div>
        </Link>
      </div>

      {user && (
        <div className="mx-4 mb-4 rounded-2xl bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal text-white font-semibold text-sm">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-white/40 truncate">{user.email || user.phone}</p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {mainNav.map((item) => {
      const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-royal/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-electric-light' : ''}`} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-white/30" />}
              </Link>
            )
          })}
        </nav>

        {isAdmin && (
          <>
            <Separator className="my-4 bg-white/10" />
            <p className="px-3 mb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Administration
            </p>
            <nav className="space-y-1">
              {adminNav.map((item) => {
      const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-accent-orange/20 text-white shadow-sm'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-accent-orange' : ''}`} />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-white/30" />}
                  </Link>
                )
              })}
            </nav>
          </>
        )}
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
          setUser(data.user)
          setCurrentUser(data.user)
          setLoading(false)
        } else {
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
        }
      })
      .catch(() => {
        if (!cancelled) router.push('/login')
      })

    return () => {
      cancelled = true
    }
  }, [router, setCurrentUser, clearLegacyAuthStorage])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-3 border-royal/30 border-t-royal rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0">
        <SidebarContent user={user} onLogout={handleLogout} />
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
          <SidebarContent user={user} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 lg:pl-0">
          {children}
        </div>
      </main>
    </div>
  )
}
