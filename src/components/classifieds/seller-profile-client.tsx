'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'
import {
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  MessageSquare,
  UserPlus,
  Package,
  Clock,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, timeAgo } from '@/lib/format'
import { useAppStore, type Listing } from '@/lib/store'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ReviewData {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  author: { id: string; name: string; avatar: string | null }
}

interface SellerData {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  role: string
  isVerified: boolean
  createdAt: string
  _count: {
    listings: number
    reviewsReceived: number
    followers: number
    following: number
  }
  sellerStats: {
    totalSales: number
    avgRating: number
    totalReviews: number
    responseTime: string | null
    responseRate: number | null
  } | null
  profile: {
    city: string | null
    country: string | null
    totalViews: number
    totalLeads: number
  } | null
}

export function SellerProfileClient({ sellerId }: { sellerId: string }) {
  const router = useRouter()
  const [seller, setSeller] = useState<SellerData | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [listingsLoading, setListingsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')
  const [isFollowing, setIsFollowing] = useState(false)
  const { categories, currentUser } = useAppStore()

  useEffect(() => {
    if (!sellerId) return
    document.title = 'Loading seller...'
    Promise.all([
      fetch(`/api/users/${sellerId}`).then((r) => r.json()),
      fetch(`/api/users/${sellerId}/listings?status=active&limit=12`).then((r) => r.json()),
      fetch(`/api/users/${sellerId}/reviews`).then((r) => r.json()),
    ])
      .then(([userData, listingsData, reviewsData]) => {
        const s = userData.user
        setSeller(s)
        setListings(listingsData.listings || [])
        setReviews(reviewsData.reviews || [])
        if (s?.name) document.title = `${s.name} - Seller Profile | ChapKE`
      })
      .catch(() => toast.error('Failed to load seller'))
      .finally(() => {
        setLoading(false)
        setListingsLoading(false)
      })
  }, [sellerId])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        {loading ? (
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ) : !seller ? (
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="text-center py-20">
              <div className="h-20 w-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h1 className="text-2xl font-bold text-navy mb-2">Seller Not Found</h1>
              <p className="text-slate-500 mb-6">This seller profile does not exist.</p>
              <Link href="/">
                <Button className="rounded-xl bg-royal">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-royal transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-3xl p-6 sticky top-24">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative h-24 w-24 mx-auto rounded-2xl overflow-hidden bg-royal shadow-lg shadow-royal/20">
                  {seller.avatar ? (
                    <Image
                      src={seller.avatar}
                      alt={seller.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white text-3xl font-bold">
                      {seller.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <h1 className="text-xl font-bold text-navy">{seller.name}</h1>
                  {seller.isVerified && (
                    <ShieldCheck className="h-5 w-5 text-royal" />
                  )}
                </div>
                {seller.profile?.city && (
                  <p className="flex items-center justify-center gap-1 text-sm text-slate-500 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {seller.profile.city}, Kenya
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 rounded-xl bg-royal/5">
                  <p className="text-lg font-bold text-navy">{seller._count.listings}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Listings</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-50">
                  <p className="text-lg font-bold text-navy">
                    {seller.sellerStats?.avgRating ? seller.sellerStats.avgRating.toFixed(1) : '—'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Rating</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-accent-purple/10">
                  <p className="text-lg font-bold text-navy">{seller.sellerStats?.totalSales || 0}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sales</p>
                </div>
              </div>

              {/* Bio */}
              {seller.bio && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{seller.bio}</p>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Calendar className="h-4 w-4" />
                <span>Member since {new Date(seller.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full rounded-xl bg-royal shadow-lg shadow-royal/20"
                  onClick={async () => {
                    if (!currentUser) {
                      toast.error('Please login to message this seller')
                      router.push('/login')
                      return
                    }
                    try {
                      const res = await fetch('/api/messages', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ receiverId: sellerId, content: `Hi, I'm interested in your listings on ChapKE.` }),
                      })
                      if (res.ok) {
                        router.push('/dashboard/messages')
                      }
                    } catch {
                      toast.error('Failed to start conversation')
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Seller
                </Button>
                <Button
                  variant="outline"
                  className={`w-full rounded-xl border-slate-200 hover:bg-slate-50 ${isFollowing ? 'border-royal/30 text-royal bg-royal/5' : ''}`}
                  onClick={async () => {
                    if (!currentUser) {
                      toast.error('Please login to follow sellers')
                      router.push('/login')
                      return
                    }
                    setIsFollowing(!isFollowing)
                    toast.success(isFollowing ? 'Unfollowed' : 'Following seller')
                  }}
                >
                  <UserPlus className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-royal' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>

              {/* Response Info */}
              {seller.sellerStats?.responseTime && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-center">
                  <p className="text-xs text-emerald-600 font-medium">
                    Usually responds in {seller.sellerStats.responseTime}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 w-fit">
              {(['listings', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-royal text-white shadow-md'
                      : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                  }`}
                >
                  {tab === 'listings' ? `Listings (${seller._count.listings})` : `Reviews (${seller._count.reviewsReceived})`}
                </button>
              ))}
            </div>

            {activeTab === 'listings' && (
              <div>
                {listingsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 rounded-2xl" />
                    ))}
                  </div>
                ) : listings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listings.map((listing, i) => {
                      const images = listing.images || []
                      const hasImage = images.length > 0
                      return (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link href={`/listing/${listing.slug || listing.id}`}>
                            <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-premium hover:shadow-premium-xl hover:-translate-y-1.5 transition-all duration-400">
                              <div className="relative aspect-[4/3] w-full overflow-hidden">
                                {hasImage ? (
                                  <Image
                                    src={images[0]?.url}
                                    alt={listing.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-slate-300">
                                    <Package className="h-10 w-10 text-slate-400" />
                                  </div>
                                )}
                                {listing.isFeatured && (
                                  <Badge className="absolute top-3 left-3 bg-royal text-white border-none text-[10px] font-semibold rounded-lg">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="p-4">
                                <p className="text-lg font-bold text-navy">
                                  {listing.price === 0 ? (
                                    <span className="text-emerald-500">Free</span>
                                  ) : (
                                    formatPrice(listing.price)
                                  )}
                                </p>
                                <h3 className="text-sm font-semibold mt-1 line-clamp-2 text-navy/80">
                                  {listing.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-electric" />
                                    {listing.location.name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-accent-purple" />
                                    {timeAgo(listing.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100">
                    <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No active listings yet</p>
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
          </motion.div>
        </div>
      </div>
    )}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
