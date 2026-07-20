'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Heart, MessageCircle, Phone, Eye, Star, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, timeAgo } from '@/lib/format'
import { useAppStore, type Listing } from '@/lib/store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const categoryColors: Record<string, { bg: string; border: string; text: string; placeholderBg: string; placeholderText: string }> = {
  vehicles: { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-700', placeholderBg: 'bg-emerald-50', placeholderText: 'text-emerald-300' },
  property: { bg: 'bg-amber-100', border: 'border-l-amber-500', text: 'text-amber-700', placeholderBg: 'bg-amber-50', placeholderText: 'text-amber-300' },
  electronics: { bg: 'bg-sky-100', border: 'border-l-sky-500', text: 'text-sky-700', placeholderBg: 'bg-sky-50', placeholderText: 'text-sky-300' },
  'phones-tablets': { bg: 'bg-violet-100', border: 'border-l-violet-500', text: 'text-violet-700', placeholderBg: 'bg-violet-50', placeholderText: 'text-violet-300' },
  fashion: { bg: 'bg-pink-100', border: 'border-l-pink-500', text: 'text-pink-700', placeholderBg: 'bg-pink-50', placeholderText: 'text-pink-300' },
  jobs: { bg: 'bg-indigo-100', border: 'border-l-indigo-500', text: 'text-indigo-700', placeholderBg: 'bg-indigo-50', placeholderText: 'text-indigo-300' },
  services: { bg: 'bg-teal-100', border: 'border-l-teal-500', text: 'text-teal-700', placeholderBg: 'bg-teal-50', placeholderText: 'text-teal-300' },
  agriculture: { bg: 'bg-lime-100', border: 'border-l-lime-500', text: 'text-lime-700', placeholderBg: 'bg-lime-50', placeholderText: 'text-lime-300' },
  'furniture-home': { bg: 'bg-red-100', border: 'border-l-red-500', text: 'text-red-700', placeholderBg: 'bg-red-50', placeholderText: 'text-red-300' },
  'health-beauty': { bg: 'bg-rose-100', border: 'border-l-rose-500', text: 'text-rose-700', placeholderBg: 'bg-rose-50', placeholderText: 'text-rose-300' },
  'sports-outdoors': { bg: 'bg-cyan-100', border: 'border-l-cyan-500', text: 'text-cyan-700', placeholderBg: 'bg-cyan-50', placeholderText: 'text-cyan-300' },
  'business-industrial': { bg: 'bg-slate-100', border: 'border-l-slate-500', text: 'text-slate-700', placeholderBg: 'bg-slate-50', placeholderText: 'text-slate-300' },
  'books-media': { bg: 'bg-purple-100', border: 'border-l-purple-500', text: 'text-purple-700', placeholderBg: 'bg-purple-50', placeholderText: 'text-purple-300' },
  'baby-kids': { bg: 'bg-yellow-100', border: 'border-l-yellow-500', text: 'text-yellow-700', placeholderBg: 'bg-yellow-50', placeholderText: 'text-yellow-300' },
  'pets-animals': { bg: 'bg-stone-100', border: 'border-l-stone-500', text: 'text-stone-700', placeholderBg: 'bg-stone-50', placeholderText: 'text-stone-300' },
  'food-drinks': { bg: 'bg-red-100', border: 'border-l-red-500', text: 'text-red-700', placeholderBg: 'bg-red-50', placeholderText: 'text-red-300' },
  'hobbies-crafts': { bg: 'bg-fuchsia-100', border: 'border-l-fuchsia-500', text: 'text-fuchsia-700', placeholderBg: 'bg-fuchsia-50', placeholderText: 'text-fuchsia-300' },
  'travel-tourism': { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-700', placeholderBg: 'bg-blue-50', placeholderText: 'text-blue-300' },
}

function getCategoryColors(category: { slug?: string; parentId?: string | null }, categories: { id: string; slug: string; parentId: string | null }[]) {
  if (category.slug && categoryColors[category.slug]) {
    return categoryColors[category.slug]
  }
  if (category.parentId) {
    const parent = categories.find(c => c.id === category.parentId)
    if (parent && categoryColors[parent.slug]) {
      return categoryColors[parent.slug]
    }
  }
  return { bg: 'bg-slate-100', border: 'border-l-slate-400', text: 'text-slate-600', placeholderBg: 'bg-slate-50', placeholderText: 'text-slate-300' }
}

interface ListingCardProps {
  listing: Listing
  index?: number
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const { toggleFavorite, isFavorite, categories } = useAppStore()
  const images = listing.images || []
  const hasImage = images.length > 0
  const favorited = isFavorite(listing.id)

  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(listing.id)
  }, [listing.id, toggleFavorite])

  const colors = getCategoryColors(listing.category, categories)

  const [showActions, setShowActions] = useState(false)

  const handleQuickChat = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (listing.user?.id) {
      const link = document.createElement('a')
      link.href = currentUser ? `/dashboard/messages` : '/login'
      link.click()
    }
  }

  const handleQuickCall = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (listing.user?.phone) {
      window.open(`tel:${listing.user.phone}`)
    } else {
      toast.error('Phone number not available')
    }
  }

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const phone = listing.user?.phone?.replace(/[^0-9]/g, '')
    if (phone) {
      const text = `Hi, I'm interested in "${listing.title}" on ChapKE`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
    } else {
      toast.error('WhatsApp number not available')
    }
  }

  const { currentUser } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.4, 0, 0.2, 1] }}
    >
      <Link
        href={`/listing/${listing.slug || listing.id}`}
        className={cn(
          'group block overflow-hidden rounded-2xl bg-white transition-all duration-400',
          'border-l-[3px]',
          colors.border,
          'shadow-premium hover:shadow-premium-xl hover:-translate-y-1.5',
          'border border-slate-100'
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {hasImage ? (
            <Image
              src={images[0].url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className={cn('flex h-full w-full items-center justify-center', colors.placeholderBg)}>
              <div className="text-center p-4">
                <div className={cn('text-4xl sm:text-5xl font-bold', colors.placeholderText)}>
                  {listing.category.name.charAt(0)}
                </div>
                <div className={cn('text-[10px] font-medium uppercase tracking-wider', colors.placeholderText)}>
                  {listing.category.name}
                </div>
              </div>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={cn(
              'absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
              favorited
                ? 'bg-white text-red-500 shadow-lg shadow-red-500/20 scale-100'
                : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
            )}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {listing.isFeatured && (
              <Badge className="bg-royal text-white border-none text-[10px] px-2 py-0.5 shadow-md font-semibold rounded-lg">
                Featured
              </Badge>
            )}
            {listing.isPromoted && (
              <Badge className="bg-accent-red text-white border-none text-[10px] px-2 py-0.5 shadow-md font-semibold rounded-lg">
                Promoted
              </Badge>
            )}
            <Badge
              variant={listing.condition === 'New' ? 'default' : 'secondary'}
              className={cn(
                'text-[10px] px-2 py-0.5 border-none shadow-sm font-medium rounded-lg',
                listing.condition === 'New'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/90 backdrop-blur-sm text-slate-600'
              )}
            >
              {listing.condition}
            </Badge>
          </div>

          {/* View count */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-medium">
            <Eye className="h-3 w-3" />
            {listing.views || 0}
          </div>

          {/* Image count */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full font-medium">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {images.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-lg font-bold text-navy">
            {listing.price === 0 ? (
              <span className="text-emerald-500">Free</span>
            ) : (
              formatPrice(listing.price)
            )}
          </p>
          <h3 className="text-sm font-semibold mt-1.5 line-clamp-2 leading-snug text-navy/80 group-hover:text-navy transition-colors">
            {listing.title}
          </h3>

          {/* Verified seller badge */}
          {listing.user?.isVerified && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <Star className="h-2.5 w-2.5 fill-current" />
                Verified Seller
              </div>
              {listing.user?.name && (
                <span className="text-[10px] text-slate-400 truncate">{listing.user.name.split(' ')[0]}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0 text-electric" />
              {listing.location.name}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3 text-accent-purple" />
              {timeAgo(listing.createdAt)}
            </span>
          </div>

          {listing.isNegotiable && (
            <span className="mt-2 inline-flex items-center rounded-full border border-royal/20 bg-royal/5 px-2 py-0.5 text-[10px] font-semibold text-royal">
              Negotiable
            </span>
          )}

          {/* Quick actions */}
          <div className="mt-3 flex items-center gap-1.5">
            <button
              onClick={handleQuickChat}
              className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-royal/5 text-royal text-[10px] font-semibold hover:bg-royal/10 transition-colors"
            >
              <MessageCircle className="h-3 w-3" /> Chat
            </button>
            <button
              onClick={handleQuickCall}
              className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Phone className="h-3 w-3" /> Call
            </button>
            <button
              onClick={handleQuickWhatsApp}
              className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg bg-[#25D366]/10 text-[#25D366] text-[10px] font-semibold hover:bg-[#25D366]/20 transition-colors"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
