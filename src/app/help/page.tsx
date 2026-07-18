'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  Shield,
  CreditCard,
  Package,
  Users,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
}

const categoryIcons: Record<string, React.ElementType> = {
  General: HelpCircle,
  Account: Users,
  Listings: Package,
  Payments: CreditCard,
  Safety: Shield,
  Selling: Package,
  Buying: Package,
}

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [formSent, setFormSent] = useState(false)

  useEffect(() => {
    fetch('/api/faqs')
      .then((r) => r.json())
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load FAQs'))
      .finally(() => setLoading(false))
  }, [])

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs
    const q = searchQuery.toLowerCase()
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    )
  }, [faqs, searchQuery])

  const groupedFaqs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {}
    for (const faq of filteredFaqs) {
      const cat = faq.category || 'General'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(faq)
    }
    return groups
  }, [filteredFaqs])

  const [sending, setSending] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: formState.subject, category: 'general', message: formState.message }),
      })
      if (res.ok) {
        setFormSent(true)
        setFormState({ name: '', email: '', subject: '', message: '' })
        toast.success('Message sent! We\'ll get back to you soon.')
      } else {
      const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to send message')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy text-white">
        <div className="container mx-auto px-4 lg:px-8 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
              <HelpCircle className="h-4 w-4" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              How Can We <span className="text-electric-light">Help You?</span>
            </h1>
            <p className="text-lg text-white/60 mb-8">
              Find answers to common questions or reach out to our support team.
            </p>
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 rounded-2xl bg-white/95 backdrop-blur-sm border-0 text-navy placeholder:text-slate-400 shadow-xl focus:ring-2 focus:ring-royal/20"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Package, label: 'Listings', color: 'bg-royal' },
            { icon: CreditCard, label: 'Payments', color: 'bg-emerald-500' },
            { icon: Shield, label: 'Safety', color: 'bg-amber-500' },
            { icon: Users, label: 'Account', color: 'bg-violet-500' },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-slate-100 shadow-premium hover:shadow-premium-lg transition-all"
              onClick={() => setSearchQuery(item.label)}
            >
              <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-navy">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">Frequently Asked Questions</h2>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : Object.keys(groupedFaqs).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedFaqs).map(([category, items]) => {
      const Icon = categoryIcons[category] || HelpCircle
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-royal/5 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-royal" />
                      </div>
                      <h3 className="text-lg font-bold text-navy">{category}</h3>
                    </div>
                    <div className="space-y-2">
                      {items.map((faq) => (
                        <div
                          key={faq.id}
                          className="rounded-2xl bg-white border border-slate-100 shadow-premium overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                            className="w-full flex items-center justify-between p-5 text-left"
                          >
                            <span className="text-sm font-semibold text-navy pr-4">{faq.question}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                                openId === faq.id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {openId === faq.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No results found for &ldquo;{searchQuery}&rdquo;</p>
              <button onClick={() => setSearchQuery('')} className="text-sm text-royal mt-2 hover:underline">
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-premium-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Contact Info */}
              <div className="bg-navy p-8 text-white">
                <h2 className="text-xl font-bold mb-2">Get in Touch</h2>
                <p className="text-sm text-white/50 mb-8">
                  Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
                </p>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: 'support@chap.co.ke', desc: 'Email us anytime' },
                    { icon: Phone, label: '+254 700 000 000', desc: 'Mon-Fri, 8am-6pm EAT' },
                    { icon: MessageCircle, label: 'Live Chat', desc: 'Instant responses' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-electric-light" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-white/40">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-2 p-8">
                {formSent ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                      <Send className="h-7 w-7 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-2">Message Sent!</h3>
                    <p className="text-slate-500 text-sm">We&apos;ll get back to you within 24 hours.</p>
                    <button
                      onClick={() => setFormSent(false)}
                      className="mt-4 text-sm text-royal hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label>
                        <Input
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
                        <Input
                          required
                          type="email"
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject</label>
                      <Input
                        required
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        className="rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Message</label>
                      <Textarea
                        required
                        rows={4}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white resize-none"
                        placeholder="Tell us more..."
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-royal shadow-lg shadow-royal/20 h-11"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
