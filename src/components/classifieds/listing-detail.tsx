'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MapPin,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  Tag,
  Share2,
  MessageCircle,
  ExternalLink,
  Heart,
  ShieldCheck,
  Shield,
  Copy,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice, timeAgo } from '@/lib/format'
import { useAppStore, type Listing } from '@/lib/store'
import { ListingCard } from './listing-card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ListingDetail() {
  const {
    selectedListing,
    listings,
    setSelectedListing,
    toggleFavorite,
    isFavorite,
  } = useAppStore()

  const listingId = selectedListing?.id ?? null
  const [currentImage, setCurrentImage] = useState(0)

  const prevIdRef = useRef(listingId)
  if (prevIdRef.current !== listingId) {
    prevIdRef.current = listingId
    setCurrentImage(0)
  }

  if (!selectedListing) return null

  const listing = selectedListing
  const favorited = isFavorite(listing.id)
  const images = listing.images || []
  const hasImages = images.length > 0

  const similar = listings
    .filter((l) => l.categoryId === listing.categoryId && l.id !== listing.id)
    .slice(0, 4)

  const handleClose = () => setSelectedListing(null)

  const getListingUrl = () => `${window.location.origin}/listing/${listing.slug || listing.id}`

  const handleWhatsAppShare = () => {
    const text = `${listing.title} - ${formatPrice(listing.price)} on ChapKE. Check it out!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + getListingUrl())}`, '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getListingUrl())
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} - ${formatPrice(listing.price)}`,
          url: getListingUrl(),
        })
      }
    } catch {}
  }

  const nextImage = () => {
    if (hasImages) setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    if (hasImages) setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <AnimatePresence>
      {selectedListing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto"
        >
          {/* Top bar */}
          <div className="sticky top-0 z-10 glass-strong border-b border-slate-200/60">
            <div className="flex items-center justify-between p-3 max-w-6xl mx-auto">
              <Button variant="ghost" size="sm" onClick={handleClose} className="rounded-xl hover:bg-slate-100">
                <X className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(listing.id)}
                  className={cn('rounded-xl hover:bg-slate-100', favorited ? 'text-red-500' : '')}
                >
                  <Heart className={favorited ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                  <span className="sr-only">Favorite</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl">
                    <DropdownMenuItem onClick={handleWhatsAppShare} className="rounded-lg">
                      <MessageSquare className="h-4 w-4 mr-2 text-emerald-600" />
                      Share via WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink} className="rounded-lg">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare} className="rounded-lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      More sharing options
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Images + Description */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image gallery */}
                <div className="relative">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white shadow-premium-xl">
                    {hasImages ? (
                      <Image
                        src={images[currentImage].url}
                        alt={`${listing.title} - Image ${currentImage + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-royal/5">
                        <div className="text-7xl font-bold text-royal/10 mb-2">
                          {listing.category.name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">{listing.category.name}</span>
                      </div>
                    )}

                    {hasImages && images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-navy flex items-center justify-center transition-all shadow-lg"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-navy flex items-center justify-center transition-all shadow-lg"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {hasImages && images.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            i === currentImage
                              ? 'w-8 bg-royal'
                              : 'w-2 bg-slate-200 hover:bg-slate-300'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {listing.isFeatured && (
                    <Badge className="bg-royal text-white border-none font-semibold rounded-xl px-3 py-1">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="secondary" className="rounded-xl px-3 py-1 font-medium">
                    {listing.condition}
                  </Badge>
                  {listing.isNegotiable && (
                    <Badge variant="outline" className="border-accent-orange/30 text-accent-orange rounded-xl px-3 py-1 font-medium">
                      Negotiable
                    </Badge>
                  )}
                </div>

                {/* Safety Tips */}
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50 p-4 text-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Shield className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 mb-1">Safety Tips</p>
                    <p className="text-amber-700/80 leading-relaxed text-xs">
                      Meet in a safe, public place. Never pay in advance. Verify the item before paying.
                    </p>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="bg-white rounded-3xl p-6 shadow-premium border border-slate-100">
                  <h1 className="text-2xl sm:text-3xl font-bold text-navy leading-tight">
                    {listing.title}
                  </h1>
                  <p className="text-3xl sm:text-4xl font-bold text-navy mt-3">
                    {listing.price === 0 ? (
                      <span className="text-emerald-500">Free</span>
                    ) : (
                      formatPrice(listing.price)
                    )}
                  </p>
                  <Separator className="my-5" />
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 text-sm p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                      <Tag className="h-4 w-4 text-royal" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Category</p>
                      <p className="font-semibold text-navy">{listing.category.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/5">
                      <MapPin className="h-4 w-4 text-electric" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Location</p>
                      <p className="font-semibold text-navy">{listing.location.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/5">
                      <Clock className="h-4 w-4 text-accent-purple" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Posted</p>
                      <p className="font-semibold text-navy">{timeAgo(listing.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/5">
                      <Eye className="h-4 w-4 text-accent-orange" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Views</p>
                      <p className="font-semibold text-navy">{listing.views}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Seller info + Actions */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 space-y-5 shadow-premium sticky top-24">
                  <h3 className="font-bold text-lg text-navy">Seller Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-royal flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-royal/20">
                      {listing.contactName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-navy">{listing.contactName}</p>
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verified Seller</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-2.5">
                    <Button className="w-full gap-2 rounded-xl h-11 font-semibold bg-royal shadow-lg shadow-royal/20 transition-all" asChild>
                      <a href={`tel:${listing.contactPhone}`}>
                        <Phone className="h-4 w-4" />
                        Call Seller
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-xl h-11 font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all"
                      asChild
                    >
                      <a
                        href={`https://wa.me/${listing.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${listing.title} - ${formatPrice(listing.price)} (from ChapKE)`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    </Button>
                    {listing.contactEmail && (
                      <Button variant="outline" className="w-full gap-2 rounded-xl h-11 font-semibold border-slate-200 hover:bg-slate-50 transition-all" asChild>
                        <a href={`mailto:${listing.contactEmail}`}>
                          <Mail className="h-4 w-4" />
                          Send Email
                        </a>
                      </Button>
                    )}
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-2.5 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-electric" />
                      {listing.location.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-accent-purple" />
                      {timeAgo(listing.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar listings */}
            {similar.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-navy mb-6">Similar Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {similar.map((l, i) => (
                    <ListingCard key={l.id} listing={l} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
