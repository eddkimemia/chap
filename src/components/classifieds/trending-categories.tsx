'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Car, Home, Briefcase, Monitor, Smartphone, Shirt, Sofa, TreePine, Wrench, Dog, Building2, ShoppingBag } from 'lucide-react'

const trendIconMap: Record<string, React.ElementType> = {
  vehicles: Car, property: Home, jobs: Briefcase, electronics: Monitor,
  'phones-tablets': Smartphone, fashion: Shirt, 'furniture-home': Sofa,
  'agriculture-food': TreePine, services: Wrench, 'pets-animals': Dog,
  'business-industrial': Building2, 'food-drinks': ShoppingBag,
}

const trendColors: Record<string, string> = {
  vehicles: 'bg-emerald-50 text-emerald-600', property: 'bg-amber-50 text-amber-600',
  jobs: 'bg-indigo-50 text-indigo-600', electronics: 'bg-sky-50 text-sky-600',
  'phones-tablets': 'bg-violet-50 text-violet-600', fashion: 'bg-pink-50 text-pink-600',
  'furniture-home': 'bg-red-50 text-red-600', 'agriculture-food': 'bg-lime-50 text-lime-600',
  services: 'bg-teal-50 text-teal-600', 'pets-animals': 'bg-stone-50 text-stone-600',
  'business-industrial': 'bg-slate-50 text-slate-600', 'food-drinks': 'bg-rose-50 text-rose-600',
}

export function TrendingCategories() {
  const { categories, listings } = useAppStore()

  const trending = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of listings) {
      const slug = l.category.slug
      counts.set(slug, (counts.get(slug) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([slug, count]) => {
        const cat = categories.find(c => c.slug === slug)
        return { slug, name: cat?.name || slug, count, icon: trendIconMap[slug] || ShoppingBag, color: trendColors[slug] || 'bg-slate-50 text-slate-600' }
      })
  }, [categories, listings])

  if (!trending.length) return null

  return (
    <section className="py-16 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-red/5">
            <ShoppingBag className="h-5 w-5 text-accent-red" />
          </div>
          <div>
            <p className="text-xs font-semibold text-accent-red tracking-wider uppercase">Trending Now</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">Popular Categories</h2>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {trending.map((item, i) => (
            <motion.button
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                useAppStore.getState().setSelectedCategory(item.slug)
                useAppStore.setState({ view: 'listings' })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left hover:shadow-premium-lg transition-all hover:-translate-y-1"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-navy text-sm mb-1">{item.name}</h3>
              <p className="text-[11px] text-slate-400">{item.count.toLocaleString()} ads</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
