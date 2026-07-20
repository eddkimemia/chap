'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, X, MapPin, Clock, Phone, Mail,
  MessageCircle, Heart, Shield, Copy, MessageSquare,
  Eye, Tag, Star, ShieldCheck, ChevronDown, ChevronUp,
  Flag, ZoomIn, Calendar, Hash, User, Package, AlertTriangle,
  Truck, RefreshCw,
  CheckCircle, Play, Send, AlertCircle, Zap, Edit, MessageSquareMore, HelpCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatPrice, timeAgo } from '@/lib/format'
import { useAppStore, type Listing, type ListingImage } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ReviewAuthor {
  id: string; name: string; avatar: string | null; isVerified: boolean
}
interface ReviewData {
  id: string; rating: number; title: string; comment: string; createdAt: string
  author: ReviewAuthor
}
interface MiniListing {
  id: string; slug?: string; title: string; price: number; currency: string
  images: { url: string }[]; createdAt: string; condition: string
  location: { name: string } | null
  isFeatured?: boolean; category?: { name: string; slug: string }
}
interface SellerStatsData {
  avgRating: number; totalReviews: number; totalSales: number
  responseTime: number; responseRate: number
}
interface BreadcrumbItem {
  name: string; url: string
}

interface ProductDetailProps {
  listing: Listing & {
    user: { id: string; name: string; avatar: string | null; isVerified: boolean; createdAt: string; role: string; bio: string | null }
    videos: { id: string; url: string; thumbnail: string; duration: number }[]
    documents: { id: string; url: string; name: string; type: string }[]
    customFields?: string; tags?: string
  }
  sellerListings: MiniListing[]
  reviews: ReviewData[]
  similarListings: MiniListing[]
  sellerStats: SellerStatsData | null
  breadcrumbItems: BreadcrumbItem[]
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(sizeClass, star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200')}
        />
      ))}
    </div>
  )
}

function ImageLightbox({ images, current, onClose, onPrev, onNext }: {
  images: ListingImage[]; current: number; onClose: () => void; onPrev: () => void; onNext: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2">
          <X className="h-8 w-8" />
        </button>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); onPrev() }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2">
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNext() }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2">
              <ChevronRight className="h-10 w-10" />
            </button>
          </>
        )}
        <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-8" onClick={(e) => e.stopPropagation()}>
          <Image
            src={images[current]?.url}
            alt={`Image ${current + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
            unoptimized
            priority
          />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation() }}
              className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/40')}
            />
          ))}
        </div>
        <div className="absolute bottom-6 right-6 text-white/50 text-sm">
          {current + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function ReportDialog({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('spam')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || reason.length < 10) {
      toast.error('Please provide more details (at least 10 characters)')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, type, reason }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit report')
      }
      toast.success('Report submitted. Our team will review it within 24 hours.')
      setOpen(false)
      setReason('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
          <Flag className="h-3.5 w-3.5" /> Report
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Report Listing
          </DialogTitle>
          <DialogDescription>
            Help us keep ChapKE safe. Why are you reporting &ldquo;{listingTitle.slice(0, 60)}&rdquo;?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reason for reporting</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="spam">Spam or misleading</SelectItem>
                <SelectItem value="scam">Scam or fraudulent</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="fake">Fake or counterfeit</SelectItem>
                <SelectItem value="duplicate">Duplicate listing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea
              placeholder="Please describe the issue in detail..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl min-h-[100px]"
              required
              minLength={10}
            />
            <p className="text-xs text-slate-400">{reason.length} / 2000</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-red-500 hover:bg-red-600 border-0">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SellerListingCard({ item }: { item: MiniListing }) {
  const imgSrc = item.images?.[0]?.url
  return (
    <Link href={`/listing/${item.slug || item.id}`} className="group flex-shrink-0 w-44 sm:w-48">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2">
        {imgSrc ? (
          <Image src={imgSrc} alt={item.title} width={192} height={144} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl font-bold">
            {item.title.charAt(0)}
          </div>
        )}
      </div>
      <p className="text-sm font-bold text-navy truncate">{formatPrice(item.price)}</p>
      <p className="text-xs text-slate-500 truncate">{item.title}</p>
    </Link>
  )
}

function SimilarCard({ item }: { item: MiniListing }) {
  const imgSrc = item.images?.[0]?.url
  return (
    <Link href={`/listing/${item.slug || item.id}`} className="group block">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5 relative">
        {imgSrc ? (
          <Image src={imgSrc} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 25vw" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl font-bold">
            {item.title.charAt(0)}
          </div>
        )}
        {item.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-royal text-white border-none text-[9px] px-1.5 py-0.5 font-semibold rounded-md">Featured</Badge>
        )}
      </div>
      <p className="text-sm font-bold text-navy truncate">{formatPrice(item.price)}</p>
      <p className="text-xs text-slate-500 truncate mt-0.5">{item.title}</p>
      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
        <span>{item.location?.name}</span>
        <span>·</span>
        <span>{timeAgo(item.createdAt)}</span>
      </div>
    </Link>
  )
}

export function ProductDetailClient({
  listing, sellerListings, reviews, similarListings, sellerStats, breadcrumbItems,
}: ProductDetailProps) {
  const { favorites, toggleFavorite, isFavorite, currentUser } = useAppStore()
  const isOwner = currentUser && currentUser.id === listing.user.id
  const [currentImage, setCurrentImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [reviewList, setReviewList] = useState(reviews)
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', message: '' })
  const [sendingMessage, setSendingMessage] = useState(false)
  const [offerDialog, setOfferDialog] = useState<{ open: boolean; amount: string }>({ open: false, amount: '' })
  const [sendingOffer, setSendingOffer] = useState(false)

  const images = listing.images || []
  const videos = listing.videos || []
  const hasImages = images.length > 0
  const favorited = isFavorite(listing.id)

  const customFields: Record<string, string> = (() => {
    try { return JSON.parse(listing.customFields || '{}') } catch { return {} }
  })()

  const tags: string[] = (() => {
    try { return JSON.parse(listing.tags || '[]') } catch { return [] }
  })()

  const displayedReviews = showAllReviews ? reviewList : reviewList.slice(0, 3)
  const avgRating = sellerStats?.avgRating ?? (reviewList.length > 0 ? reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length : 0)
  const reviewCount = sellerStats?.totalReviews ?? reviewList.length
  const memberSince = listing.user.createdAt
    ? new Date(listing.user.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short' })
    : 'N/A'

  const prevImage = () => setCurrentImage((p) => (p - 1 + images.length) % images.length)
  const nextImage = () => setCurrentImage((p) => (p + 1) % images.length)

  const handleWhatsApp = () => {
    const phone = listing.contactPhone.replace(/[^0-9]/g, '')
    const text = `Hi, I'm interested in: ${listing.title} - ${formatPrice(listing.price)} (ChapKE)`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch { toast.error('Failed to copy link') }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: listing.title, text: `${listing.title} - ${formatPrice(listing.price)}`, url: window.location.href }) } catch {}
    } else { handleCopyLink() }
  }

  const handleMakeOffer = () => {
    if (!currentUser) { toast.error('Please login to make an offer'); return }
    setOfferDialog({ open: true, amount: '' })
  }

  const handleSendOffer = async () => {
    if (!currentUser) { toast.error('Please login to make an offer'); return }
    const amount = offerDialog.amount.trim()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid offer amount')
      return
    }
    setSendingOffer(true)
    try {
      const content = `Hi, I'd like to make an offer of KES ${Number(amount).toLocaleString()} on "${listing.title}" (listed at ${formatPrice(listing.price)}).`
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: listing.user.id,
          listingId: listing.id,
          content,
          type: 'offer',
        }),
      })
      if (res.ok) {
        toast.success('Offer sent! The seller will be notified.')
        setOfferDialog({ open: false, amount: '' })
      } else {
        const d = await res.json()
        throw new Error(d.error || 'Failed to send offer')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSendingOffer(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.message) {
      toast.error('Please fill in all fields')
      return
    }
    setSendingMessage(true)
    try {
      const phone = listing.contactPhone.replace(/[^0-9]/g, '')
      const text = `Hi, I'm ${contactForm.name}. ${contactForm.message}\n\nRe: ${listing.title} - ${formatPrice(listing.price)}`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
      toast.success('Opening WhatsApp...')
      setContactForm({ name: '', message: '' })
    } catch { toast.error('Failed to open WhatsApp') }
    finally { setSendingMessage(false) }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { toast.error('Please login to leave a review'); return }
    if (isOwner) { toast.error('You cannot review your own listing'); return }
    if (!reviewForm.rating) { toast.error('Please select a rating'); return }
    if (!reviewForm.comment || reviewForm.comment.length < 3) { toast.error('Please write at least 3 characters'); return }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: listing.user.id,
          listingId: listing.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      })
      if (res.ok) {
        const newReview = await res.json()
        const authorName = currentUser?.name || 'You'
        const optimistic = { ...newReview, author: { ...newReview.author, name: authorName } }
        setReviewList((prev: ReviewData[]) => [optimistic, ...prev])
        setReviewForm({ rating: 0, title: '', comment: '' })
        toast.success('Review submitted!')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to submit review')
      }
    } catch { toast.error('Failed to submit review') }
    finally { setSubmittingReview(false) }
  }

  const schemaSpecs: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: 'Condition', value: listing.condition, icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
    { label: 'Category', value: listing.category.name, icon: <Tag className="h-4 w-4 text-royal" /> },
    { label: 'Location', value: listing.location.name, icon: <MapPin className="h-4 w-4 text-electric" /> },
    { label: 'Listed', value: timeAgo(listing.createdAt), icon: <Calendar className="h-4 w-4 text-accent-purple" /> },
    { label: 'Listing ID', value: `#${listing.id.slice(-8).toUpperCase()}`, icon: <Hash className="h-4 w-4 text-slate-400" /> },
    { label: 'Views', value: `${listing.views}`, icon: <Eye className="h-4 w-4 text-accent-orange" /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {lightboxOpen && (
        <ImageLightbox images={images} current={currentImage} onClose={() => setLightboxOpen(false)} onPrev={prevImage} onNext={nextImage} />
      )}

      <div className="container mx-auto px-4 lg:px-8 py-4 sm:py-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6 overflow-x-auto pb-1">
          {breadcrumbItems.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
              {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
              {i < breadcrumbItems.length - 1 ? (
                <Link href={item.url} className="hover:text-royal transition-colors">{item.name}</Link>
              ) : (
                <span className="text-navy font-medium truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Gallery + Main Content */}
          <div className="lg:col-span-2 space-y-6 order-1">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-premium border border-slate-100">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-slate-100">
                {hasImages ? (
                  <div className="relative w-full h-full cursor-pointer" onClick={() => setLightboxOpen(true)}>
                    <Image
                      src={images[currentImage].url}
                      alt={`${listing.title} - Image ${currentImage + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      unoptimized
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <div className="text-7xl font-bold text-slate-200 mb-2">{listing.category.name.charAt(0)}</div>
                    <span className="text-xs uppercase tracking-wider font-medium">{listing.category.name}</span>
                  </div>
                )}
                {hasImages && images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/90 hover:bg-white text-navy flex items-center justify-center shadow-lg transition-all">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/90 hover:bg-white text-navy flex items-center justify-center shadow-lg transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button onClick={() => setLightboxOpen(true)} className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all">
                  <ZoomIn className="h-3.5 w-3.5" /> View Full Size
                </button>
              </div>

              {/* Thumbnails */}
              {hasImages && images.length > 1 && (
                <div className="flex gap-2 p-3 sm:p-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={img.id || i}
                      onClick={() => setCurrentImage(i)}
                      className={cn('relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all', i === currentImage ? 'border-royal ring-1 ring-royal/30' : 'border-transparent hover:border-slate-200')}
                    >
                      <Image src={img.url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" unoptimized />
                    </button>
                  ))}
                  {videos.length > 0 && videos.map((v, i) => (
                    <div key={v.id} className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-slate-200">
                      {v.thumbnail ? (
                        <Image src={v.thumbnail} alt={`Video thumbnail for ${listing.title}`} fill className="object-cover opacity-60" sizes="64px" unoptimized />
                      ) : (
                        <div className="absolute inset-0 bg-slate-800" />
                      )}
                      <Play className="h-5 w-5 text-white absolute" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Section */}
            {videos.length > 0 && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-premium border border-slate-100">
                <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4 text-royal" /> Videos ({videos.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {videos.map((v) => (
                    <div key={v.id} className="aspect-video rounded-xl overflow-hidden bg-black relative group cursor-pointer">
                      {v.thumbnail ? (
                        <Image src={v.thumbnail} alt={`Video thumbnail for ${listing.title}`} fill className="object-cover opacity-70" sizes="(max-width: 640px) 100vw, 50vw" unoptimized />
                      ) : (
                        <div className="absolute inset-0 bg-slate-800" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-5 w-5 text-navy ml-0.5" />
                        </div>
                      </div>
                      {v.duration > 0 && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                          {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Header - Mobile */}
            <div className="lg:hidden bg-white rounded-2xl p-4 sm:p-6 shadow-premium border border-slate-100">
              <h1 className="text-xl sm:text-2xl font-bold text-navy leading-tight">{listing.title}</h1>
              <div className="flex items-baseline gap-2 mt-3">
                <p className="text-2xl sm:text-3xl font-bold text-navy">
                  {listing.price === 0 ? <span className="text-emerald-500">Free</span> : formatPrice(listing.price)}
                </p>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <span className="text-sm text-slate-400 line-through">{formatPrice(listing.originalPrice)}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {listing.isFeatured && <Badge className="bg-royal text-white border-none text-[10px] px-2 py-0.5 font-semibold rounded-lg">Featured</Badge>}
                {listing.isPromoted && <Badge className="bg-accent-orange text-white border-none text-[10px] px-2 py-0.5 font-semibold rounded-lg">Promoted</Badge>}
                {listing.isUrgent && <Badge className="bg-red-500 text-white border-none text-[10px] px-2 py-0.5 font-semibold rounded-lg animate-pulse">Urgent</Badge>}
                {listing.isNegotiable && <Badge variant="outline" className="border-accent-orange/30 text-accent-orange text-[10px] px-2 py-0.5 font-medium rounded-lg">Negotiable</Badge>}
                {listing.condition && <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium rounded-lg">{listing.condition}</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-electric" />{listing.location.name}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-accent-purple" />{timeAgo(listing.createdAt)}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-slate-400" />{listing.views} views</span>
              </div>
              {/* Short Highlights */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[10px] bg-royal/5 text-royal px-2 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            {Object.keys(customFields).length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-premium border border-slate-100">
                <h3 className="font-bold text-navy text-base sm:text-lg mb-4">Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(customFields).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{key}</p>
                      <p className="text-sm font-semibold text-navy mt-0.5 capitalize">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-premium border border-slate-100">
              <h3 className="font-bold text-navy text-base sm:text-lg mb-3">Description</h3>
              <div className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
                  {tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-premium border border-slate-100">
              <h3 className="font-bold text-navy text-base sm:text-lg mb-4">Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {schemaSpecs.map((spec) => (
                  <div key={spec.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm shrink-0">
                      {spec.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{spec.label}</p>
                      <p className="text-sm font-semibold text-navy truncate">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Information */}
            {(() => {
              const MemberSince = listing.user.createdAt
                ? new Date(listing.user.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short' })
                : 'N/A'
              const AvgRating = sellerStats?.avgRating ?? 0
              const ReviewCount = sellerStats?.totalReviews ?? reviews.length
              return (
                <div className="bg-white rounded-3xl p-6 shadow-premium border border-slate-100">
                  <h3 className="font-bold text-navy text-sm mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-royal" /> Seller Information
                  </h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl">
                      <AvatarImage src={listing.user.avatar || ''} />
                      <AvatarFallback className="rounded-2xl bg-royal text-white font-bold text-lg">
                        {listing.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-navy truncate">{listing.user.name}</p>
                        {listing.user.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={AvgRating} />
                        <span className="text-xs text-slate-500">({ReviewCount})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Member since {MemberSince}</p>
                    </div>
                  </div>

                  {listing.user.bio && (
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">{listing.user.bio}</p>
                  )}

                  {sellerStats && (
                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-center">
                        <p className="text-sm font-bold text-navy">{sellerStats.totalSales}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Sales</p>
                      </div>
                      <div className="text-center border-x border-slate-200">
                        <p className="text-sm font-bold text-navy">{sellerStats.responseRate?.toFixed(0) || '—'}%</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Response</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-navy">{sellerStats.responseTime ? `${sellerStats.responseTime.toFixed(0)}h` : '—'}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Response Time</p>
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {isOwner ? (
                    <div className="space-y-2.5">
                      <Button
                        className="w-full gap-2 rounded-xl h-11 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all border-0"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/listings/${listing.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'sold' }),
                            })
                            if (res.ok) toast.success('Marked as sold!'); else toast.error('Failed to update')
                          } catch { toast.error('Failed to update') }
                        }}
                      >
                        <CheckCircle className="h-4 w-4" /> Mark as Sold
                      </Button>
                      <Button className="w-full gap-2 rounded-xl h-11 font-semibold border-slate-200 text-navy hover:bg-slate-50 transition-all" variant="outline" asChild>
                        <Link href={`/dashboard/listings/${listing.id}/edit`}><Edit className="h-4 w-4" /> Edit Listing</Link>
                      </Button>
                      <Button className="w-full gap-2 rounded-xl h-11 font-semibold bg-accent-red hover:bg-accent-red/90 text-white shadow-lg shadow-accent-red/20 transition-all border-0" asChild>
                        <Link href={`/dashboard/listings`}><Zap className="h-4 w-4" /> Boost Listing</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <Button className="w-full gap-2 rounded-xl h-11 font-semibold bg-royal hover:bg-royal/90 shadow-lg shadow-royal/20 transition-all border-0" asChild>
                        <a href={`tel:${listing.contactPhone}`}><Phone className="h-4 w-4" /> Call Seller</a>
                      </Button>
                      <Button variant="outline" className="w-full gap-2 rounded-xl h-11 font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all" onClick={handleWhatsApp}>
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </Button>
                      {listing.contactEmail && (
                        <Button variant="outline" className="w-full gap-2 rounded-xl h-11 font-semibold border-slate-200 hover:bg-slate-50 transition-all" asChild>
                          <a href={`mailto:${listing.contactEmail}`}><Mail className="h-4 w-4" /> Send Email</a>
                        </Button>
                      )}
                      <Button variant="outline" className="w-full gap-2 rounded-xl h-11 font-semibold border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all" onClick={handleMakeOffer}>
                        <Send className="h-4 w-4" /> Make an Offer
                      </Button>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Delivery / Shipping */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-premium border border-slate-100">
              <h3 className="font-bold text-navy text-base sm:text-lg mb-3">Delivery &amp; Shipping</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="h-5 w-5 text-royal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-navy">Delivery Options</p>
                    <p className="text-xs text-slate-500 mt-0.5">Contact the seller to arrange delivery or pickup. Many sellers offer delivery within Nairobi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <RefreshCw className="h-5 w-5 text-accent-orange shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-navy">Returns &amp; Warranty</p>
                    <p className="text-xs text-slate-500 mt-0.5">Return policies vary by seller. Please discuss warranty and return terms with the seller before purchasing.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews & Ratings */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-premium border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-navy text-base sm:text-lg">Seller Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={avgRating} size="md" />
                    <span className="text-sm font-semibold text-navy">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
                    <span className="text-xs text-slate-400">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              {currentUser && !isOwner && (
                <form onSubmit={handleSubmitReview} className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <p className="text-sm font-semibold text-navy">Leave a Review</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}>
                        <Star className={cn('h-6 w-6 transition-colors', star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300')} />
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Review title (optional)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    className="h-9 text-sm rounded-xl border-slate-200"
                  />
                  <Textarea
                    placeholder="Write your review..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    className="min-h-[60px] text-sm rounded-xl border-slate-200"
                    required
                  />
                  <Button type="submit" disabled={submittingReview} size="sm" className="rounded-xl text-xs font-semibold bg-royal hover:bg-royal/90 border-0">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}

              {reviewList.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedReviews.map((review) => (
                    <div key={review.id} className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={review.author.avatar || ''} />
                            <AvatarFallback className="text-[10px] bg-royal/10 text-royal">{review.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm font-semibold text-navy">{review.author.name}</span>
                            {review.author.isVerified && <ShieldCheck className="h-3 w-3 text-emerald-500 inline ml-1" />}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{timeAgo(review.createdAt)}</span>
                      </div>
                      <StarRating rating={review.rating} />
                      {review.title && <p className="text-xs font-semibold text-navy mt-1.5">{review.title}</p>}
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                  {reviewList.length > 3 && (
                    <button onClick={() => setShowAllReviews(!showAllReviews)} className="flex items-center gap-1 text-xs text-royal font-semibold hover:text-royal/80 transition-colors mx-auto mt-2">
                      {showAllReviews ? 'Show Less' : `Show All ${reviewList.length} Reviews`}
                      {showAllReviews ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Questions & Answers */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-premium border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-navy text-base sm:text-lg flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-royal" /> Questions & Answers
                </h3>
              </div>
              <div className="text-center py-6 text-slate-400">
                <MessageSquareMore className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                <p className="text-sm">No questions yet. Be the first to ask!</p>
                <Button variant="outline" size="sm" className="mt-3 rounded-xl text-xs" onClick={handleWhatsApp}>
                  Ask a Question
                </Button>
              </div>
            </div>

            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <div className="pt-2">
                <h2 className="text-lg sm:text-xl font-bold text-navy mb-4">Similar Listings</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {similarListings.map((item) => (
                    <SimilarCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 lg:self-start order-2">
            {/* Price Card - Desktop */}
            <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-premium border border-slate-100">
              <h1 className="text-xl font-bold text-navy leading-tight">{listing.title}</h1>
              <div className="flex items-baseline gap-2 mt-3">
                <p className="text-3xl font-bold text-navy">
                  {listing.price === 0 ? <span className="text-emerald-500">Free</span> : formatPrice(listing.price)}
                </p>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <span className="text-sm text-slate-400 line-through">{formatPrice(listing.originalPrice)}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {listing.isFeatured && <Badge className="bg-royal text-white border-none text-[10px] px-2 py-0.5 font-semibold rounded-lg">Featured</Badge>}
                {listing.isPromoted && <Badge className="bg-accent-orange text-white border-none text-[10px] px-2 py-0.5 font-semibold rounded-lg">Promoted</Badge>}
                {listing.isUrgent && <Badge className="bg-red-500 text-white border-none text-[10px] px-2 py-0.5 font-semibold rounded-lg animate-pulse">Urgent</Badge>}
                {listing.isNegotiable && <Badge variant="outline" className="border-accent-orange/30 text-accent-orange text-[10px] px-2 py-0.5 font-medium rounded-lg">Negotiable</Badge>}
                {listing.condition && <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium rounded-lg">{listing.condition}</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-electric" />{listing.location.name}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-accent-purple" />{timeAgo(listing.createdAt)}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-slate-400" />{listing.views} views</span>
              </div>
            </div>

            {/* Save & Share Card */}
            <div className="bg-white rounded-3xl p-5 shadow-premium border border-slate-100">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFavorite(listing.id)}
                  className={cn('rounded-xl text-xs font-semibold flex-1', favorited ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-50' : 'border-slate-200 hover:border-red-200 hover:text-red-500')}
                >
                  <Heart className={cn('h-3.5 w-3.5 mr-1', favorited && 'fill-current')} />
                  {favorited ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-xl text-xs font-semibold border-slate-200">
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                </Button>
              </div>

              <Separator className="my-3" />
              <p className="text-[11px] font-semibold text-navy mb-2">Share on</p>
              <div className="flex gap-2">
                <button aria-label="Share on Facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#1877F2] text-white text-xs font-medium hover:bg-[#1877F2]/90 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
                <button aria-label="Share on X" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(listing.title + ' ' + formatPrice(listing.price))}&url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#000] text-white text-xs font-medium hover:bg-[#000]/90 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X
                </button>
                <button aria-label="Share on WhatsApp" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(listing.title + ' ' + formatPrice(listing.price) + ' ' + window.location.href)}`, '_blank')} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#25D366] text-white text-xs font-medium hover:bg-[#25D366]/90 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button aria-label="Share on LinkedIn" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#0A66C2] text-white text-xs font-medium hover:bg-[#0A66C2]/90 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </button>
                <button aria-label="Share via Email" onClick={() => window.open(`mailto:?subject=${encodeURIComponent(listing.title)}&body=${encodeURIComponent(listing.title + ' - ' + formatPrice(listing.price) + '\n\n' + window.location.href)}`)} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-600 text-white text-xs font-medium hover:bg-slate-700 transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Email
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center">
                <ReportDialog listingId={listing.id} listingTitle={listing.title} />
              </div>
            </div>

            {/* Safety Tips - in right column */}
            <div className="flex items-start gap-3 rounded-2xl sm:rounded-3xl border border-amber-200/60 bg-amber-50 p-4 sm:p-5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 text-sm mb-1">Safety Tips for Buyers</p>
                <ul className="text-amber-700/80 text-xs sm:text-sm leading-relaxed space-y-1">
                  <li>• Meet the seller in a safe, public place</li>
                  <li>• Never pay in advance without seeing the item</li>
                  <li>• Verify the item condition before making payment</li>
                  <li>• Use ChapKE messaging to keep a record of communication</li>
                  <li>• Trust your instincts — if it seems too good to be true, it probably is</li>
                </ul>
              </div>
            </div>

            {/* Seller's Other Listings */}
            {sellerListings.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-premium border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy text-sm">More from {listing.user.name.split(' ')[0]}</h3>
                  <Link href={`/seller/${listing.user.id}`} className="text-xs text-royal font-semibold hover:underline">View All</Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                  {sellerListings.map((item) => (
                    <SellerListingCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Listings */}
            {similarListings.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-premium border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy text-sm">Recommended for You</h3>
                </div>
                <div className="space-y-3">
                  {similarListings.slice(0, 4).map((item) => {
                    const imgSrc = item.images?.[0]?.url
                    return (
                      <Link key={item.id} href={`/listing/${item.slug || item.id}`} className="flex gap-3 group">
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          {imgSrc ? (
                            <Image src={imgSrc} alt={item.title} width={64} height={64} className="h-full w-full object-cover group-hover:scale-105 transition-transform" unoptimized />
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 font-bold">{item.title.charAt(0)}</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-navy truncate">{formatPrice(item.price)}</p>
                          <p className="text-xs text-slate-500 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.location?.name} · {timeAgo(item.createdAt)}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Listing ID */}
            <div className="text-center">
              <p className="text-[10px] text-slate-400">
                Listing ID: #{listing.id.slice(-8).toUpperCase()} · {listing.views} views
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 shadow-2xl px-3 py-2.5 safe-area-bottom">
        <div className="flex items-center gap-1.5 max-w-lg mx-auto">
          <Button size="sm" className="flex-1 h-10 rounded-xl text-[11px] font-semibold bg-royal hover:bg-royal/90 border-0 shadow-lg shadow-royal/20" asChild>
            <a href={`tel:${listing.contactPhone}`}><Phone className="h-3.5 w-3.5 mr-1" /> Call</a>
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-10 rounded-xl text-[11px] font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={handleWhatsApp}>
            <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-10 rounded-xl text-[11px] font-semibold border-blue-200 text-blue-600 hover:bg-blue-50" onClick={handleMakeOffer}>
            <Send className="h-3.5 w-3.5 mr-1" /> Offer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn('h-10 w-10 rounded-xl', favorited ? 'border-red-200 text-red-500 bg-red-50' : 'border-slate-200')}
            onClick={() => toggleFavorite(listing.id)}
          >
            <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
          </Button>
        </div>
      </div>

      {/* Floating Save Button - Mobile */}
      <button
        onClick={() => toggleFavorite(listing.id)}
        className={cn(
          'fixed bottom-20 right-4 z-50 lg:hidden h-12 w-12 rounded-full shadow-xl flex items-center justify-center transition-all',
          favorited ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-white text-slate-400 border border-slate-200'
        )}
        aria-label={favorited ? 'Remove from favorites' : 'Save listing'}
      >
        <Heart className={cn('h-5 w-5', favorited && 'fill-current')} />
      </button>

      {/* Make Offer Dialog */}
      <Dialog open={offerDialog.open} onOpenChange={(o) => setOfferDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-royal" /> Make an Offer</DialogTitle>
            <DialogDescription>
              Send your offer to the seller for &ldquo;{listing.title.slice(0, 60)}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Listed Price</p>
              <p className="text-lg font-bold text-navy">{formatPrice(listing.price)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-amount">Your Offer Amount (KES)</Label>
              <Input
                id="offer-amount"
                type="number"
                min="1"
                placeholder="Enter your offer..."
                value={offerDialog.amount}
                onChange={(e) => setOfferDialog((p) => ({ ...p, amount: e.target.value }))}
                className="h-12 text-lg font-bold text-center rounded-xl border-slate-200"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOfferDialog({ open: false, amount: '' })} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSendOffer} disabled={sendingOffer} className="rounded-xl bg-royal hover:bg-royal/90 border-0 shadow-lg shadow-royal/20">
              {sendingOffer ? 'Sending...' : 'Send Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
