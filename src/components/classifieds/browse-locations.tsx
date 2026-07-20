'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { MapPin, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BrowseLocations() {
  const { locations, listings } = useAppStore()

  const locationData = useMemo(() => {
    const counts = new Map<string, number>()
    const catsByLoc = new Map<string, Map<string, number>>()
    for (const l of listings) {
      const slug = l.location.slug
      counts.set(slug, (counts.get(slug) || 0) + 1)
      if (!catsByLoc.has(slug)) catsByLoc.set(slug, new Map())
      const catMap = catsByLoc.get(slug)!
      const catName = l.category.name
      catMap.set(catName, (catMap.get(catName) || 0) + 1)
    }
    return locations
      .map(loc => {
        const catMap = catsByLoc.get(loc.slug) || new Map()
        const topCats = [...catMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => ({ name }))
        return { ...loc, count: counts.get(loc.slug) || 0, topCategories: topCats }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [locations, listings])

  if (!locationData.length) return null

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/5">
              <MapPin className="h-5 w-5 text-electric" />
            </div>
            <div>
              <p className="text-xs font-semibold text-electric tracking-wider uppercase">Browse by Location</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy">Find Items Near You</h2>
            </div>
          </div>
          <Link href="/location">
            <Button variant="ghost" size="sm" className="text-royal rounded-xl font-semibold">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-4 px-4 snap-x snap-mandatory"
        >
          {locationData.map((loc) => (
            <Link
              key={loc.id}
              href={`/location/${loc.slug}`}
              className="group relative w-[280px] sm:w-[300px] shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-gradient-to-r from-red-500 to-blue-600">
                <div>
                  <h2 className="text-lg font-bold text-white">{loc.name}</h2>
                  <p className="text-sm text-white/60 mt-0.5">
                    {loc.count.toLocaleString()} listing{loc.count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                  <ChevronRight className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="px-4 py-3 bg-white">
                {loc.topCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {loc.topCategories.map((cat: { name: string }) => (
                      <span key={cat.name} className="text-[11px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
