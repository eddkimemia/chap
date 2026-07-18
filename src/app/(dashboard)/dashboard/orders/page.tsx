'use client'

import { useState, useEffect } from 'react'
import {
  Zap, CheckCircle2, Star, Sparkles, Shield, TrendingUp, Camera,
  MessageSquare, Clock, ArrowRight, Crown, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/format'

import { apiFetch } from '@/lib/api-client'

interface Plan {
  id: string; name: string; slug: string; description: string
  price: number; currency: string; interval: string
  features: string; maxListings: number; maxImages: number; maxVideos: number
  isFeatured: boolean; isPromoted: boolean; order: number
}

interface Subscription {
  id: string; status: string; startDate: string; endDate: string
  autoRenew: boolean; plan: Plan
}

const planIcons: Record<string, React.ElementType> = {
  free: Shield,
  premium: Star,
  business: Crown,
}

const planColors: Record<string, { card: string; badge: string; button: string; accent: string }> = {
  free: {
    card: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    button: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    accent: 'text-slate-500',
  },
  premium: {
    card: 'border-amber-200 ring-1 ring-amber-300',
    badge: 'bg-amber-100 text-amber-800',
    button: 'bg-amber-500 text-white hover:bg-amber-600',
    accent: 'text-amber-600',
  },
  business: {
    card: 'border-royal/20 ring-1 ring-royal/30',
    badge: 'bg-royal/10 text-royal',
    button: 'bg-royal text-white hover:bg-royal/90',
    accent: 'text-royal',
  },
}

export default function PremiumPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/plans').then(r => r.ok ? r.json() : []),
      apiFetch('/api/subscriptions').then(r => r.ok ? r.json() : []),
    ]).then(([plansData, subsData]) => {
      setPlans(Array.isArray(plansData) ? plansData : [])
      const active = Array.isArray(subsData) ? subsData.find((s: Subscription) => s.status === 'active') : null
      setSubscription(active || null)
    }).catch(() => toast.error('Failed to load plans')).finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId)
    try {
      const res = await apiFetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      if (res.ok) {
        const sub = await res.json()
        setSubscription(sub)
        toast.success('Subscribed successfully!')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to subscribe')
      }
    } catch { toast.error('Network error') } finally { setSubscribing(null) }
  }

  const currentPlanSlug = subscription?.plan?.slug || 'free'
  const featureList = (plan: Plan): string[] => {
    let features: string[] = []
    try { const parsed = JSON.parse(plan.features); features = Array.isArray(parsed) ? parsed : [] } catch {}
    return features
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Premium Plans</h1>
        <p className="text-sm text-slate-400 mt-1">Unlock more features and boost your listings</p>
      </div>

      {/* Current plan banner */}
      {subscription && (
        <Card className="rounded-2xl border-0 bg-gradient-to-r from-amber-50 to-royal/5 shadow-premium overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">You&apos;re on the <span className="text-royal">{subscription.plan.name}</span> plan</p>
                <p className="text-xs text-slate-400">
                  {subscription.status === 'active' ? 'Active' : subscription.status} &middot;
                  Renews {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs rounded-lg">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
            </Badge>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-premium overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Separator />
                {Array(4).fill(0).map((_, j) => <Skeleton key={j} className="h-4 w-full" />)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = planIcons[plan.slug] || Shield
            const colors = planColors[plan.slug] || planColors.free
            const isCurrent = currentPlanSlug === plan.slug
            const features = featureList(plan)

            return (
              <Card key={plan.id} className={`rounded-2xl shadow-premium overflow-hidden relative ${colors.card} ${isCurrent ? 'ring-2 ring-royal' : ''}`}>
                {plan.isFeatured && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-amber-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Popular
                    </div>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${isCurrent ? 'bg-royal text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-navy">{plan.name}</h3>
                    {isCurrent && (
                      <Badge className="text-[9px] bg-royal/10 text-royal border-royal/20 rounded-lg">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-navy">{formatPrice(plan.price)}</span>
                    <span className="text-sm text-slate-400 ml-1">/{plan.interval === 'yearly' ? 'year' : 'month'}</span>
                  </div>

                  {/* Plan limits */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Max Listings</span>
                      <span className="font-semibold text-navy">{plan.maxListings === 999 ? 'Unlimited' : plan.maxListings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Images per Listing</span>
                      <span className="font-semibold text-navy">{plan.maxImages}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Videos</span>
                      <span className="font-semibold text-navy">{plan.maxVideos || '—'}</span>
                    </div>
                    {plan.isFeatured && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Featured Listings</span>
                        <span className="font-semibold text-amber-600 flex items-center gap-1"><Star className="h-3 w-3" /> Included</span>
                      </div>
                    )}
                    {plan.isPromoted && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Promoted</span>
                        <span className="font-semibold text-royal flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Included</span>
                      </div>
                    )}
                  </div>

                  <Separator className="mb-4" />

                  {/* Features */}
                  <div className="space-y-2.5 mb-6">
                    {features.length > 0 ? features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{f}</span>
                      </div>
                    )) : (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{plan.maxListings} active listings</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{plan.maxImages} images per listing</span>
                        </div>
                        {plan.isFeatured && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600">Featured in search results</span>
                          </div>
                        )}
                        {plan.isPromoted && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600">Promoted badge on listings</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || subscribing === plan.id}
                    className={`w-full rounded-xl border-0 ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' : colors.button}`}
                  >
                    {subscribing === plan.id ? (
                      <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Subscribing...</>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      <><Zap className="h-4 w-4 mr-1.5" /> {plan.price > 0 ? 'Subscribe' : 'Get Started'}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Perks section */}
      <Card className="rounded-2xl border-0 bg-gradient-to-br from-navy to-royal/90 shadow-premium overflow-hidden">
        <CardContent className="p-8 text-center">
          <Crown className="h-12 w-12 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Go Premium, Grow Faster</h2>
          <p className="text-white/60 max-w-lg mx-auto mb-6">
            Premium listings get 3x more views, higher search ranking, and a professional badge that builds trust with buyers.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Star, label: 'Featured First', desc: 'Priority in search' },
              { icon: TrendingUp, label: 'More Views', desc: '3x more exposure' },
              { icon: Camera, label: 'More Photos', desc: 'Up to 20 images' },
              { icon: MessageSquare, label: 'Priority Support', desc: 'Fast responses' },
            ].map((p) => (
              <div key={p.label} className="text-center">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <p.icon className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-sm font-semibold text-white">{p.label}</p>
                <p className="text-[10px] text-white/50">{p.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
