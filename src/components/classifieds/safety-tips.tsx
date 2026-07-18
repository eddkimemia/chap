'use client'

import { motion } from 'framer-motion'
import { Shield, Ban, MapPin, SearchCheck } from 'lucide-react'

const tips = [
  {
    icon: Ban,
    title: 'Avoid Advance Payments',
    description: 'Never pay before seeing the item. Legitimate sellers will not ask for deposits.',
    color: 'text-red-500', bg: 'bg-red-50',
  },
  {
    icon: MapPin,
    title: 'Meet in Public Places',
    description: 'Always meet the seller in a busy, public location during daylight hours.',
    color: 'text-amber-500', bg: 'bg-amber-50',
  },
  {
    icon: SearchCheck,
    title: 'Inspect Items Before Paying',
    description: 'Check the item thoroughly before handing over any money.',
    color: 'text-royal', bg: 'bg-royal/5',
  },
  {
    icon: Shield,
    title: 'Verify Seller Identity',
    description: 'Check seller ratings, join date, and verified status before making a deal.',
    color: 'text-emerald-500', bg: 'bg-emerald-50',
  },
]

export function SafetyTips() {
  return (
    <section className="py-16 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Stay Safe</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">Safety Tips for Buyers</h2>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto">Follow these tips to ensure a safe and secure trading experience.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-premium-lg transition-all"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tip.bg} mb-4`}>
                <tip.icon className={`h-6 w-6 ${tip.color}`} />
              </div>
              <h3 className="font-bold text-navy mb-2 text-sm">{tip.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tip.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
