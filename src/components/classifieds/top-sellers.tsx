'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Star, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

export function TopSellers() {
  const { listings } = useAppStore()

  const sellers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar: string | null; isVerified: boolean; count: number; locations: Set<string> }>()
    for (const l of listings) {
      if (!l.user?.id) continue
      const existing = map.get(l.user.id)
      if (existing) {
        existing.count++
        existing.locations.add(l.location.name)
      } else {
        map.set(l.user.id, {
          id: l.user.id,
          name: l.user.name || 'Unknown',
          avatar: l.user.avatar || null,
          isVerified: l.user.isVerified || false,
          count: 1,
          locations: new Set([l.location.name]),
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [listings])

  if (!sellers.length) return null

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-500 tracking-wider uppercase">Top Sellers</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy">Most Active Sellers</h2>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {sellers.map((seller, i) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/seller/${seller.id}`} className="block group">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center hover:shadow-premium-lg transition-all hover:-translate-y-1">
                  <div className="relative mx-auto mb-3">
                    <Avatar className="h-16 w-16 mx-auto ring-2 ring-slate-100 group-hover:ring-royal/20 transition-all">
                      <AvatarImage src={seller.avatar || undefined} />
                      <AvatarFallback className="bg-royal text-white text-sm font-bold">
                        {seller.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {seller.isVerified && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Star className="h-3 w-3 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-navy text-sm truncate">{seller.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">{seller.count} listing{seller.count !== 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-slate-300 mt-1 truncate">{Array.from(seller.locations).slice(0, 2).join(', ')}</p>
                  <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl text-[11px] h-8 border-slate-200 font-medium">
                    View Profile
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
