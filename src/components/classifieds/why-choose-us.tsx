'use client'

import { ShieldCheck, MessageCircle, Search, BadgeCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified Sellers',
    description: 'All sellers are verified to ensure a safe and trustworthy marketplace experience.',
    color: 'text-emerald-500', bg: 'bg-emerald-50',
  },
  {
    icon: MessageCircle,
    title: 'Secure Messaging',
    description: 'Built-in chat with end-to-end encryption keeps your conversations private.',
    color: 'text-royal', bg: 'bg-royal/5',
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Advanced filters and AI-powered recommendations help you find exactly what you need.',
    color: 'text-accent-orange', bg: 'bg-accent-orange/5',
  },
  {
    icon: ShieldCheck,
    title: 'Safe Marketplace',
    description: 'Our safety team monitors listings 24/7 to prevent scams and fraud.',
    color: 'text-electric', bg: 'bg-electric/5',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Why Choose Us</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">Trusted by Thousands of Kenyans</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group rounded-2xl border border-slate-100 bg-white p-6 hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-navy mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
