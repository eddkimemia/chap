'use client'

import { Home, Search, Plus, Heart, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const router = useRouter()
  const { view, setShowPostAd, resetToHome, favorites, currentUser } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-slate-100 bg-white safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-16 px-2">
        <NavButton
          icon={Home}
          label="Home"
          active={view === 'home' && !favorites.length}
          onClick={resetToHome}
        />
        <NavButton
          icon={Search}
          label="Search"
          active={view === 'listings'}
          onClick={() => useAppStore.setState({ view: 'listings' })}
        />
        <button
          onClick={() => setShowPostAd(true)}
          className="flex h-13 w-13 -mt-5 items-center justify-center rounded-2xl bg-royal text-white shadow-lg shadow-royal/30 active:scale-95 transition-all"
          aria-label="Post Ad"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <NavButton
          icon={Heart}
          label="Saved"
          active={view === 'favorites'}
          badge={favorites.length > 0 ? favorites.length : undefined}
          onClick={() => useAppStore.setState({ view: 'favorites' })}
        />
        <NavButton
          icon={User}
          label="Profile"
          active={false}
          onClick={() => router.push(currentUser ? '/dashboard' : '/login')}
        />
      </div>
    </nav>
  )
}

function NavButton({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] relative transition-all duration-200 rounded-xl',
        active ? 'text-red-500' : 'text-royal'
      )}
      aria-label={label}
    >
      <div className="relative">
        <Icon className={cn('h-5 w-5 transition-transform duration-200', active && 'scale-110')} />
        {badge !== undefined && (
          <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-royal text-[9px] font-bold text-white px-1 shadow-sm">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={cn('text-[10px] font-medium', active && 'font-bold')}>
        {label}
      </span>
      {active && (
        <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-red-500" />
      )}
    </button>
  )
}
