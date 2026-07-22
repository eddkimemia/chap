'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Globe, Users, Package, Star, Shield,
  ChevronRight, Phone, Mail, ExternalLink, MessageSquare, ShoppingBag,
  Search, ArrowUpDown, Loader2, Clock, CheckCircle, ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatPrice, timeAgo } from '@/lib/format'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShopData {
  id: string
  name: string
  username: string
  avatar: string
  isVerified: boolean
  phone: string | null
  listingCount: number
  businessProfile: {
    companyName: string
    companyLogo: string
    companyBanner: string
    description: string
    industry: string
    isVerified: boolean
    website: string
    employeeCount: string
    foundedYear: number | null
    address: string
    socialLinks: string
  }
}

interface Listing {
  id: string
  slug: string
  title: string
  price: number
  currency: string
  condition: string
  isFeatured: boolean
  isNegotiable: boolean
  views: number
  createdAt: string
  location: { name: string; slug: string }
  category: { name: string; slug: string }
  images: { url: string; alt: string }[]
  user: { id: string; name: string; avatar: string; isVerified: boolean; username: string }
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  isVerified: boolean
  createdAt: string
  author: { id: string; name: string; avatar: string | null }
}

interface SellerStats {
  avgRating: number
  totalReviews: number
  totalSales: number
  responseRate: number
  responseTime: number
}

interface ShopClientProps {
  shop: ShopData
  listings: Listing[]
  sellerStats: SellerStats | null
  reviews: Review[]
}

const socialIcon: Record<string, React.ReactNode> = {
  facebook: <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  twitter: <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  x: <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  tiktok: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  youtube: <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
}

const socialBg: Record<string, string> = {
  facebook: '#1877F2',
  twitter: '#000',
  x: '#000',
  instagram: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
  linkedin: '#0A66C2',
  tiktok: '#000',
  youtube: '#FF0000',
  whatsapp: '#25D366',
}

export function ShopClient({ shop, listings, sellerStats, reviews }: ShopClientProps) {
  const router = useRouter()
  const { currentUser } = useAppStore()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')
  const bp = shop.businessProfile

  let socialLinks: Record<string, string> = {}
  try { socialLinks = JSON.parse(bp.socialLinks || '{}') } catch { /* ignore */ }

  const filtered = listings
    .filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const handleMessage = async () => {
    if (!currentUser) { toast.error('Please login to message this shop'); router.push('/login'); return }
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: shop.id, content: `Hi, I'm interested in your shop "${bp.companyName}" on ${process.env.NEXT_PUBLIC_SITE_NAME || 'ChapKE'}.` }),
      })
      if (res.ok) { router.push('/dashboard/messages') }
      else { toast.error('Failed to start conversation') }
    } catch { toast.error('Failed to start conversation') }
  }

  const handleWhatsApp = () => {
    if (!shop.phone) { toast.error('No phone number available'); return }
    const phone = shop.phone.replace(/[^0-9]/g, '')
    const text = `Hi, I'm interested in your shop "${bp.companyName}" on ${process.env.NEXT_PUBLIC_SITE_NAME || 'ChapKE'}.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const avgRating = sellerStats?.avgRating ?? 0
  const reviewCount = sellerStats?.totalReviews ?? reviews.length

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-royal transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Shop Card */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-3xl p-6 sticky top-24">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="relative h-24 w-24 mx-auto rounded-2xl overflow-hidden bg-royal shadow-lg shadow-royal/20 flex items-center justify-center">
                {bp.companyLogo ? (
                  <Image src={bp.companyLogo} alt={bp.companyName} fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-white text-3xl font-bold">{bp.companyName.charAt(0)}</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <h1 className="text-xl font-bold text-navy">{bp.companyName}</h1>
                {bp.isVerified && (
                  <Shield className="h-5 w-5 text-emerald-500 fill-emerald-500" />
                )}
              </div>
              {shop.username && (
                <p className="text-sm text-slate-400 font-mono mt-0.5">@{shop.username}</p>
              )}
              {bp.industry && (
                <p className="text-sm text-slate-500 mt-1">{bp.industry}</p>
              )}
              {bp.address && (
                <p className="flex items-center justify-center gap-1 text-sm text-slate-500 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {bp.address}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-4 rounded-xl bg-royal/5">
                <p className="text-xl font-bold text-navy">{shop.listingCount}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Listings</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50">
                <p className="text-xl font-bold text-navy">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Rating</p>
              </div>
            </div>

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Social Links</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(socialLinks).map(([platform, url]) =>
                    url ? (
                      <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-white transition-all px-3 py-1.5 rounded-lg"
                        style={{ background: socialBg[platform.toLowerCase()] || '#64748b' }}>
                        {socialIcon[platform.toLowerCase()] || <Globe className="h-3.5 w-3.5" />}
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full rounded-xl bg-royal shadow-lg shadow-royal/20"
                onClick={handleMessage}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Shop
              </Button>
              {shop.phone && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={handleWhatsApp}
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full rounded-xl border-slate-200"
                asChild
              >
                <a href={`tel:${shop.phone}`}><Phone className="h-4 w-4 mr-2" /> Call</a>
              </Button>
            </div>

            {/* Response Info */}
            {sellerStats?.responseTime ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-center">
                <p className="text-xs text-emerald-600 font-medium">
                  Usually responds in {sellerStats.responseTime > 0 ? `${sellerStats.responseTime.toFixed(0)}h` : 'a few hours'}
                </p>
              </div>
            ) : sellerStats?.responseRate ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-center">
                <p className="text-xs text-emerald-600 font-medium">
                  {sellerStats.responseRate.toFixed(0)}% response rate
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 w-fit">
            {(['listings', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  activeTab === tab
                    ? 'bg-royal text-white shadow-md'
                    : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                )}
              >
                {tab === 'listings' ? `Listings (${listings.length})` : `Reviews (${reviewCount})`}
              </button>
            ))}
          </div>

          {activeTab === 'listings' && (
            <div>
              {/* Search & Sort */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search in this shop..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-44 rounded-xl border-slate-200 bg-white">
                    <ArrowUpDown className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Listing Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600">No listings found</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {search ? 'Try a different search term.' : 'This shop has no active listings yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map((listing) => {
                    const images = listing.images || []
                    const hasImage = images.length > 0
                    return (
                      <Link key={listing.id} href={`/listing/${listing.slug || listing.id}`}>
                        <div className="group cursor-pointer overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                          <div className="relative aspect-[4/3] w-full overflow-hidden">
                            {hasImage ? (
                              <Image
                                src={images[0]?.url}
                                alt={listing.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                <Package className="h-8 w-8 text-slate-400" />
                              </div>
                            )}
                            {listing.isFeatured && (
                              <Badge className="absolute top-2 left-2 bg-royal text-white border-none text-[9px] font-semibold rounded-md px-1.5 py-0.5">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-base font-bold text-navy">
                              {listing.price === 0 ? (
                                <span className="text-emerald-500">Free</span>
                              ) : (
                                formatPrice(listing.price)
                              )}
                            </p>
                            <h3 className="text-xs font-semibold mt-1 line-clamp-2 text-navy/80 leading-snug">
                              {listing.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5 text-electric" />
                                {listing.location.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 text-accent-purple" />
                                {timeAgo(listing.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-premium">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-royal flex items-center justify-center text-white text-sm font-bold">
                        {review.author.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-sm">{review.author.name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">{timeAgo(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {review.title && <p className="font-semibold text-navy text-sm mb-1">{review.title}</p>}
                    <p className="text-sm text-slate-500 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100">
                  <Star className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
