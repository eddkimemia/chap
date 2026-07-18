'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
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
    const scored = listings
      .filter(l => !recentIds.has(l.id))
      .map(l => ({
        ...l,
        score: (l.isFeatured ? 10 : 0) + (recentCats.has(l.category.slug) ? 5 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
    return scored
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
