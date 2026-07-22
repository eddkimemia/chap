'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore, type Listing } from '@/lib/store'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListingGrid } from './listing-grid'

export function RecommendedForYou() {
  const { listings, recentlyViewed } = useAppStore()

  const recommended = useMemo(() => {
    const viewed = recentlyViewed || []
    if (!listings.length) return []
    const recentIds = new Set(viewed.map(l => l.id))
    const recentCats = new Set(viewed.slice(0, 3).map(l => l.category.slug))
    const unseen = listings.filter(l => !recentIds.has(l.id))
    if (!unseen.length) return []

    const now = new Date()
    const isPremium = (l: Listing) => l.user?.premiumUntil && new Date(l.user.premiumUntil) > now
    const isBusiness = (l: Listing) => l.user?.role === 'business' && !isPremium(l)
    const isFree = (l: Listing) => !isPremium(l) && !isBusiness(l)

    const score = (l: Listing) =>
      (l.isFeatured ? 10 : 0) + (recentCats.has(l.category.slug) ? 5 : 0) + (l.isPromoted ? 3 : 0)

    const premium = unseen.filter(isPremium).sort((a, b) => score(b) - score(a))
    const business = unseen.filter(isBusiness).sort((a, b) => score(b) - score(a))
    const free = unseen.filter(isFree).sort((a, b) => score(b) - score(a))

    const groups = [premium, business, free].filter(g => g.length > 0)
    if (!groups.length) return []

    const perGroup = Math.floor(8 / groups.length)
    let remaining = 8
    const selected: Listing[] = []

    for (const group of groups) {
      const take = Math.min(perGroup, group.length, remaining)
      selected.push(...group.slice(0, take))
      remaining -= take
    }

    if (remaining > 0) {
      const used = new Set(selected.map(l => l.id))
      const rest = unseen.filter(l => !used.has(l.id)).sort((a, b) => score(b) - score(a))
      selected.push(...rest.slice(0, remaining))
    }

    return selected.slice(0, 8)
  }, [listings, recentlyViewed])

  if (!recommended.length) return null

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/5">
              <Sparkles className="h-5 w-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-purple tracking-wider uppercase">Personalized</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy">Recommended For You</h2>
            </div>
          </div>
        </motion.div>
        <ListingGrid listings={recommended} />
      </div>
    </section>
  )
}
