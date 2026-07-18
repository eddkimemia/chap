'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const brands = [
  { name: 'Toyota', color: 'bg-red-50 text-red-600' },
  { name: 'Samsung', color: 'bg-blue-50 text-blue-600' },
  { name: 'Apple', color: 'bg-slate-50 text-slate-800' },
  { name: 'Honda', color: 'bg-red-50 text-red-600' },
  { name: 'Sony', color: 'bg-sky-50 text-sky-600' },
  { name: 'Lenovo', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Nokia', color: 'bg-cyan-50 text-cyan-600' },
  { name: 'LG', color: 'bg-rose-50 text-rose-600' },
]

export function PopularBrands() {
  const router = useRouter()

  return (
    <section className="py-16 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Popular Brands</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">Shop by Brand</h2>
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {brands.map((brand, i) => (
            <motion.button
              key={brand.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/search?q=${encodeURIComponent(brand.name)}`)}
              className={`flex items-center gap-2 rounded-2xl border border-slate-100 ${brand.color} px-6 py-4 font-bold text-sm hover:shadow-premium-lg transition-all hover:-translate-y-0.5 cursor-pointer`}
            >
              <Sparkles className="h-4 w-4" />
              {brand.name}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
