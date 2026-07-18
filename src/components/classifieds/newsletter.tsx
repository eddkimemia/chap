'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        toast.success('Subscribed! Check your email for updates.')
        setEmail('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Subscription failed')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-r from-royal to-electric relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 mx-auto mb-6">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Stay Updated</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Subscribe to our newsletter for the latest deals, buying tips, and marketplace updates.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 pl-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/30"
                required
              />
            </div>
            <Button type="submit" disabled={subscribing} className="h-12 px-6 rounded-xl bg-white text-royal font-bold hover:bg-white/90 transition-all border-0">
              <Send className="h-4 w-4 mr-2" /> Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
