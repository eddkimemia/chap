'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Grace Mwangi',
    role: 'Buyer, Nairobi',
    avatar: null,
    text: 'I found my dream car on ChapKE in just three days! The seller verification gave me confidence to make the purchase. Highly recommended!',
    rating: 5,
  },
  {
    name: 'James Otieno',
    role: 'Seller, Mombasa',
    avatar: null,
    text: 'As a small business owner, ChapKE has been a game-changer. I\'ve sold over 50 items and the platform\'s messaging system makes communication so easy.',
    rating: 5,
  },
  {
    name: 'Faith Kamau',
    role: 'Buyer & Seller, Kisumu',
    avatar: null,
    text: 'The best classifieds platform in Kenya! The safety tips and verified sellers make it feel secure. I\'ve done over 20 transactions without any issues.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">What Our Users Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 relative hover:shadow-premium-lg transition-all"
            >
              <Quote className="h-8 w-8 text-royal/10 absolute top-4 right-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={t.avatar || undefined} />
                  <AvatarFallback className="bg-royal text-white text-xs font-bold">{t.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-navy">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
