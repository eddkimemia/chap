'use client'

import { useState, useEffect } from 'react'
import {
  HelpCircle, MessageSquare, Search, ChevronDown, ChevronRight,
  FileText, Mail, Phone, ExternalLink, Send, ThumbsUp, ThumbsDown,
  Clock, CheckCircle2, AlertCircle, Plus, ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

const faqs = [
  {
    q: 'How do I create a listing?',
    a: 'Go to My Listings and click "Create Listing". Fill in the details, add photos, set your price, and publish. Your listing will go live immediately.',
  },
  {
    q: 'How do I edit or delete a listing?',
    a: 'Navigate to My Listings, find the listing you want to edit, and click the Edit button. Use the dropdown menu on each listing card to access Delete and other actions.',
  },
  {
    q: 'How do I boost or feature my listing?',
    a: 'From My Listings, open the dropdown menu on any listing and select "Promote / Feature". Choose your promotion type and duration.',
  },
  {
    q: 'How do I reply to messages?',
    a: 'Go to Messages, select a conversation, type your reply in the text box at the bottom, and press Send or hit Enter.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Settings → Security tab. Enter your current password, then your new password, and click "Change Password".',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → Security tab and click "Delete Account" in the Danger Zone. This action is irreversible.',
  },
  {
    q: 'How do I report a user or listing?',
    a: 'On any listing page, click the Report button. Choose the reason and submit. Our team will review it within 24 hours.',
  },
  {
    q: 'How do I view my analytics?',
    a: 'Go to Analytics to see your views, messages, favorites, sales, and category breakdowns. You can export data as CSV.',
  },
]

const ticketCategories = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'listing', label: 'Listing Issue' },
  { value: 'payment', label: 'Payment Problem' },
  { value: 'account', label: 'Account Issue' },
  { value: 'technical', label: 'Technical Problem' },
  { value: 'report', label: 'Report Abuse' },
  { value: 'other', label: 'Other' },
]

interface Ticket {
  id: string; subject: string; category: string; status: string
  priority: string; createdAt: string; lastUpdate: string
}

export default function SupportPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('faq')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/support/tickets').then((r) => r.ok && r.json()).then((d) => {
      if (d) setTickets(d.tickets || d)
    }).catch(() => {}).finally(() => setTicketsLoading(false))
  }, [])

  const filteredFaqs = faqs.filter((f) =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !category || !message.trim()) return toast.error('Please fill in all fields')
    setSending(true)
    try {
      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, message }),
      })
      if (res.ok) {
        toast.success('Ticket created! We\'ll respond within 24 hours.')
        setSubject(''); setCategory(''); setMessage('')
        setActiveTab('tickets')
      } else {
      const d = await res.json()
        toast.error(d.error || 'Failed to create ticket')
      }
    } catch { toast.error('Network error') } finally { setSending(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Help & Support</h1>
        <p className="text-sm text-slate-400 mt-1">Find answers or contact our support team</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-2xl bg-white border-slate-200"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-2xl bg-muted p-1">
          <TabsTrigger value="faq" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <HelpCircle className="h-4 w-4" /> FAQ
          </TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageSquare className="h-4 w-4" /> My Tickets
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Mail className="h-4 w-4" /> Contact Us
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-6">
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-5">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <HelpCircle className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                  <p>No results found for &quot;{search}&quot;</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-100 rounded-xl px-4">
                      <AccordionTrigger className="text-sm font-semibold text-navy hover:text-royal py-3.5">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-slate-500 pb-3.5">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-premium mt-4">
            <p className="text-sm text-slate-500">Was this helpful?</p>
            <Button size="sm" variant="outline" className="rounded-xl h-8 gap-1.5" onClick={() => toast.success('Thanks for your feedback!')}>
              <ThumbsUp className="h-3.5 w-3.5" /> Yes
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl h-8 gap-1.5" onClick={() => toast.success('Thanks for your feedback!')}>
              <ThumbsDown className="h-3.5 w-3.5" /> No
            </Button>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
            <Button size="sm" onClick={() => setActiveTab('contact')} className="rounded-xl bg-royal border-0 gap-1.5">
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </div>
          {ticketsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-2xl border-0 shadow-premium">
                  <CardContent className="p-5"><div className="h-5 w-48 bg-slate-100 rounded animate-pulse" /><div className="h-3 w-64 bg-slate-50 rounded animate-pulse mt-3" /></CardContent>
                </Card>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-premium">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-12 w-12 text-slate-200 mb-3" />
                <h3 className="text-lg font-bold text-navy">No tickets</h3>
                <p className="text-sm text-slate-400 mt-1">Your support tickets will appear here</p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="rounded-2xl border-0 shadow-premium card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-navy">{ticket.subject}</h3>
                        <Badge className={`text-[9px] rounded-lg ${
                          ticket.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          ticket.status === 'waiting' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>{ticket.status}</Badge>
                        <Badge className={`text-[9px] rounded-lg ${
                          ticket.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' :
                          ticket.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>{ticket.priority}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {ticket.category} &middot; Created {ticket.createdAt} &middot; Last update {ticket.lastUpdate}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border-0 shadow-premium">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-navy">Submit a Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-navy">Subject</label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        className="h-11 rounded-xl bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-navy">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {ticketCategories.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-navy">Message</label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        className="min-h-[150px] rounded-xl resize-none"
                        maxLength={2000}
                      />
                      <p className="text-xs text-slate-400 text-right">{message.length}/2000</p>
                    </div>
                    <Button type="submit" disabled={sending} className="rounded-xl bg-royal border-0 shadow-lg shadow-royal/20">
                      {sending ? 'Submitting...' : <><Send className="h-4 w-4 mr-1.5" /> Submit Ticket</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <Card className="rounded-2xl border-0 shadow-premium">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-bold text-navy">Contact Information</h3>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Email</p>
                      <a href="mailto:support@chapke.co.ke" className="text-sm text-royal hover:underline">support@chapke.co.ke</a>
                      <p className="text-xs text-slate-400">Response within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Phone</p>
                      <a href="tel:+254700000000" className="text-sm text-royal hover:underline">+254 700 000 000</a>
                      <p className="text-xs text-slate-400">Mon-Fri 8AM-5PM EAT</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500 shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Live Chat</p>
                      <p className="text-sm text-slate-400">Available 24/7</p>
                      <Button size="sm" variant="outline" className="mt-1 rounded-lg text-xs h-7 gap-1">
                        <MessageSquare className="h-3 w-3" /> Start Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-premium bg-royal/5">
                <CardContent className="p-5 text-center">
                  <Clock className="h-8 w-8 mx-auto text-royal mb-2" />
                  <h3 className="font-bold text-navy text-sm">Response Time</h3>
                  <p className="text-xs text-slate-400 mt-1">We typically respond within 24 hours on weekdays</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
