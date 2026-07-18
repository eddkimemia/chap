'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  MapPin,
  Plus,
  Menu,

  Home,
  Car,
  Monitor,
  Smartphone,
  Shirt,
  Briefcase,
  Wrench,
  TreePine,
  Sofa,
  Heart,
  Dumbbell,
  Building2,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  User,

  ChevronDown,
  MessageCircle,
  Bell,
  ShoppingBag,
  Star,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  car: Car,
  home: Building2,
  monitor: Monitor,
  smartphone: Smartphone,
  shirt: Shirt,
  briefcase: Briefcase,
  wrench: Wrench,
  trees: TreePine,
  sofa: Sofa,
  heart: Heart,
  dumbbell: Dumbbell,
  building: Building2,
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    locations,
    categories,
    selectedCategory,
    view,
    resetToHome,
    setShowPostAd,
    setSelectedCategory,
    currentUser,
    logout,
  } = useAppStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const parentCategories = categories.filter((c) => !c.parentId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      useAppStore.setState({ view: 'listings' })
    }
  }

  const handleLogout = async () => {
    await logout()
    resetToHome()
  }

  return (
    <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'glass-strong shadow-premium'
            : 'bg-white/80 backdrop-blur-sm'
        )}
      >
        <div className="container mx-auto flex h-16 items-center gap-3 px-4 lg:px-8">
          {/* Left: Logo + Back */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetToHome}
              className="flex items-center gap-2 shrink-0 group"
            >
              <img
                src="/logoicon.png"
                alt="ChapKE"
                className="h-9 w-9 rounded-xl object-cover sm:hidden"
              />
              <img
                src="/chaplogo.png"
                alt="ChapKE"
                className="hidden sm:block h-9 w-auto object-contain"
              />
            </button>
          </div>

          {/* Center: Enhanced Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 max-w-2xl mx-auto"
          >
            <div className="relative flex w-full">
              <Select
                value={selectedCategory || undefined}
                onValueChange={(val) => setSelectedCategory(val === 'all' ? '' : val)}
              >
                <SelectTrigger className="hidden md:flex h-10 sm:h-11 rounded-l-2xl rounded-r-none border-r-0 border-slate-200 bg-slate-50/80 text-xs w-[130px] lg:w-[150px] shrink-0">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="search"
                placeholder="Search for anything in Kenya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full rounded-none border-r-0 pr-3 text-sm',
                  'h-10 sm:h-11 border-slate-200 bg-slate-50/80 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all'
                )}
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 sm:h-11 rounded-l-none rounded-r-2xl px-5 bg-royal shadow-lg shadow-royal/20 hover:shadow-royal/30 transition-all border-0"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline ml-1.5 font-medium">Search</span>
              </Button>
            </div>
          </form>

          {/* Right: Icons + Post Ad + Auth + Theme + Mobile menu */}
          <div className="flex items-center gap-1 shrink-0">
            {currentUser && (
              <>
                <Link href="/dashboard/favorites">
                  <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 rounded-xl hover:bg-slate-100">
                    <Heart className="h-4 w-4 text-navy/60" />
                    <span className="sr-only">Favorites</span>
                  </Button>
                </Link>
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 rounded-xl hover:bg-slate-100 relative">
                    <MessageCircle className="h-4 w-4 text-navy/60" />
                    <span className="sr-only">Messages</span>
                  </Button>
                </Link>
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 rounded-xl hover:bg-slate-100">
                    <Bell className="h-4 w-4 text-navy/60" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Post Ad button */}
            <Button
              onClick={() => setShowPostAd(true)}
              size="sm"
              className="hidden sm:flex h-9 gap-1.5 rounded-xl bg-accent-orange text-white shadow-lg shadow-accent-orange/20 hover:shadow-accent-orange/30 transition-all border-0 font-semibold text-xs px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post Ad</span>
            </Button>

            {/* Auth Section */}
            {mounted && (
              <>
                {currentUser ? (
                  <>
                  <Link
                    href="/dashboard"
                    className="sm:hidden flex items-center gap-2 h-9 px-2 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <div className="relative h-7 w-7 rounded-full overflow-hidden bg-royal">
                        {currentUser.avatar ? (
                          <Image
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white text-[11px] font-bold">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hidden sm:flex items-center gap-2 h-9 px-2 rounded-xl hover:bg-slate-100 transition-all">
                        <div className="relative h-7 w-7 rounded-full overflow-hidden bg-royal">
                          {currentUser.avatar ? (
                            <Image
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white text-[11px] font-bold">
                              {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="hidden lg:inline text-xs font-semibold text-navy max-w-[80px] truncate">
                          {currentUser.name.split(' ')[0]}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-navy truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="h-4 w-4 text-slate-500" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/seller/${currentUser.id}`} className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4 text-slate-500" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link href="/login" className="sm:hidden flex items-center gap-2 h-9 px-2 rounded-xl hover:bg-slate-100 transition-all">
                      <div className="relative h-7 w-7 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 text-[11px] font-bold">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="h-9 rounded-xl text-xs font-medium text-navy hover:bg-slate-100">
                        <LogIn className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">Login</span>
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="h-9 rounded-xl bg-royal text-white text-xs font-semibold shadow-lg shadow-royal/20 border-0">
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">Register</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:hidden rounded-xl"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mega Menu Navigation */}
        <div className="hidden lg:flex border-t border-slate-100 bg-white">
          <div className="container mx-auto flex items-center px-4 lg:px-8 h-11">
            <nav className="flex items-center gap-0.5 overflow-x-auto w-full scrollbar-none">
              {parentCategories.slice(0, 10).map((cat) => {
                const Icon = iconMap[cat.icon] || Briefcase
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug)
                      useAppStore.setState({ view: 'listings' })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap',
                      selectedCategory === cat.slug
                        ? 'bg-royal/5 text-royal'
                        : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.name}
                  </button>
                )
              })}
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button
                onClick={() => useAppStore.setState({ view: 'listings' })}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-royal hover:bg-royal/5 rounded-lg transition-all whitespace-nowrap"
              >
                <List className="h-3.5 w-3.5" />
                More Categories
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-white/95 backdrop-blur-xl">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="flex items-center gap-2">
              <img src="/logoicon.png" alt="ChapKE" className="h-9 w-9 rounded-xl object-cover" />
              <span className="text-navy font-bold">Chap<span className="text-royal">KE</span></span>
            </SheetTitle>
          </SheetHeader>

          {/* Mobile Auth Section */}
          {currentUser && (
            <div className="mx-4 mb-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-royal">
                  {currentUser.avatar ? (
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white text-sm font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-1 p-4 pt-2">
            <Button
              variant="ghost"
              className="justify-start gap-3 rounded-xl hover:bg-primary/5 hover:text-primary"
              onClick={() => {
                resetToHome()
                setMobileOpen(false)
              }}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-3 rounded-xl hover:bg-accent-orange/5 hover:text-accent-orange"
              onClick={() => {
                setShowPostAd(true)
                setMobileOpen(false)
              }}
            >
              <Plus className="h-4 w-4" />
              Post Ad
            </Button>

            {/* Mobile Auth Buttons */}
            {!currentUser && (
              <div className="flex gap-2 mt-1">
                <Link href="/login" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button
                    className="w-full rounded-xl bg-royal text-white text-sm font-semibold border-0"
                    onClick={() => setMobileOpen(false)}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {currentUser && (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl hover:bg-primary/5 hover:text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href={`/seller/${currentUser.id}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl hover:bg-primary/5 hover:text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-xl hover:bg-red-50 hover:text-red-500"
                  onClick={() => {
                    handleLogout()
                    setMobileOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            )}

            <div className="my-3 border-t border-slate-100" />

            <p className="text-[11px] font-semibold text-muted-foreground px-3 mb-1 uppercase tracking-wider">Categories</p>
            <div className="flex flex-col gap-0.5 mb-2">
              {parentCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || Briefcase
                return (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-3 text-sm h-10 rounded-xl hover:bg-primary/5"
                    onClick={() => {
                      setSelectedCategory(cat.slug)
                      setMobileOpen(false)
                    }}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/5">
                      <Icon className="h-3.5 w-3.5 text-royal" />
                    </div>
                    {cat.name}
                  </Button>
                )
              })}
            </div>

            <div className="my-3 border-t border-slate-100" />
            <p className="text-[11px] font-semibold text-muted-foreground px-3 mb-1 uppercase tracking-wider">Locations</p>
            {locations.map((loc) => (
              <Button
                key={loc.id}
                variant="ghost"
                size="sm"
                className="justify-start gap-3 text-sm rounded-xl hover:bg-primary/5"
                onClick={() => {
                  setFilters({ location: loc.slug })
                  setMobileOpen(false)
                }}
              >
                <MapPin className="h-3.5 w-3.5 text-electric" />
                {loc.name}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
