'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Megaphone, Star, Calendar, Clock, CheckCircle2, Loader2,
  Zap, ChevronRight, TrendingUp, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'

interface Promotion {
  id: string
  type: string
  listingId: string | null
  amount: number
  duration: string
  startDate: string
  endDate: string
  status: string
}

const PROMO_PRICES = {
  weekly: 200,
  monthly: 500,
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDuration, setSelectedDuration] = useState<'weekly' | 'monthly'>('weekly')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [step, setStep] = useState<'select' | 'pay' | 'processing' | 'done'>('select')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPromotions = async () => {
    try {
      const res = await apiFetch('/api/promotions')
      if (res.ok) {
        const data = await res.json()
        setPromotions(data.promotions || [])
        setPremiumUntil(data.premiumUntil)
        setIsPremium(data.isPremiumSeller)
      }
    } catch {
      toast.error('Failed to load promotions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPromotions() }, [])
  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current) } }, [])

  const handleStartPayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid M-Pesa phone number')
      return
    }
    setStep('processing')

    const amount = PROMO_PRICES[selectedDuration]

    apiFetch('/api/payments/mpesa/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        amount,
        type: 'seller_promotion',
        description: `Shop promotion (${selectedDuration})`,
        metadata: { duration: selectedDuration },
      }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        pollPayment(data.paymentId)
      } else {
        const d = await res.json()
        toast.error(d.error || 'Payment initiation failed')
        setStep('pay')
      }
    }).catch(() => {
      toast.error('Network error')
      setStep('pay')
    })
  }

  const pollPayment = (paymentId: string) => {
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts++
      if (attempts > 40) {
        if (pollRef.current) clearInterval(pollRef.current)
        toast.error('Payment confirmation timed out')
        setStep('pay')
        return
      }
      const res = await apiFetch(`/api/payments/${paymentId}`)
      if (!res.ok) return
      const payment = await res.json()
      if (payment.status === 'completed') {
        if (pollRef.current) clearInterval(pollRef.current)
        const promoRes = await apiFetch('/api/promotions/seller', {
          method: 'POST',
          body: JSON.stringify({ duration: selectedDuration, paymentId }),
        })
        if (promoRes.ok) {
          setStep('done')
          toast.success('Shop promoted successfully!')
          setTimeout(() => { setStep('select'); setPhoneNumber(''); fetchPromotions() }, 2000)
        } else {
          const d = await promoRes.json()
          toast.error(d.error || 'Failed to activate promotion')
          setStep('pay')
        }
      } else if (payment.status === 'failed') {
        if (pollRef.current) clearInterval(pollRef.current)
        toast.error('Payment failed')
        setStep('pay')
      }
    }, 3000)
  }

  const activePromotion = promotions.find(p => p.status === 'active' && p.type === 'shop')
  const activeListingPromos = promotions.filter(p => p.status === 'active' && p.type === 'listing')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-amber-500" /> Promotions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Promote your shop and listings for more visibility</p>
        </div>
      </div>

      {/* Premium Status Card */}
      <Card className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-premium overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                <Star className="h-7 w-7 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-navy">Premium Shop</p>
                {isPremium && premiumUntil ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className="bg-emerald-500 text-white border-none text-xs px-2 py-0.5 rounded-lg">Active</Badge>
                    <span className="text-sm text-slate-500">
                      Ends {new Date(premiumUntil).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-0.5">Your shop is not promoted</p>
                )}
              </div>
            </div>
            {isPremium && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-amber-600 bg-amber-100 px-3 py-1.5 rounded-xl font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                Appears first in searches
              </div>
            )}
          </div>

          {/* Stats */}
          {activeListingPromos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Promoted Listings</p>
              <div className="flex flex-wrap gap-2">
                {activeListingPromos.map(p => (
                  <Badge key={p.id} className="bg-royal/10 text-royal border-none text-xs px-2 py-1 rounded-lg">
                    <Star className="h-3 w-3 mr-1 inline" /> Listing promo ends {new Date(p.endDate).toLocaleDateString()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shop Promotion Purchase */}
      <Card className="rounded-2xl border border-slate-100 shadow-premium">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" /> Promote Your Shop
          </CardTitle>
          <p className="text-sm text-slate-400">Premium visibility across all listing pages</p>
        </CardHeader>
        <CardContent>
          {step === 'done' ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-navy">Shop Promoted!</p>
              <p className="text-sm text-slate-400 mt-1">Your shop now appears first in search results.</p>
            </div>
          ) : step === 'processing' ? (
            <div className="text-center py-8">
              <Loader2 className="h-10 w-10 text-royal animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-navy">Waiting for M-Pesa payment...</p>
              <p className="text-xs text-slate-400 mt-1">Check your phone and enter your PIN</p>
            </div>
          ) : step === 'pay' ? (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium text-navy mb-1.5 block">M-Pesa Phone Number</label>
                <Input
                  type="tel"
                  placeholder="0712 345 678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleStartPayment}
                  className="flex-1 rounded-xl h-11 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg shadow-amber-500/20"
                >
                  <Zap className="h-4 w-4 mr-1.5" /> Pay KES {PROMO_PRICES[selectedDuration]}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                  className="rounded-xl h-11"
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => { setSelectedDuration('weekly'); setStep('pay') }}
                  className={`group relative rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 ${
                    selectedDuration === 'weekly'
                      ? 'border-amber-400 bg-amber-50/50 shadow-lg shadow-amber-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-semibold text-navy">Weekly</span>
                  </div>
                  <p className="text-2xl font-bold text-navy">KES 200</p>
                  <p className="text-xs text-slate-400 mt-1">7 days premium visibility</p>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </button>

                <button
                  onClick={() => { setSelectedDuration('monthly'); setStep('pay') }}
                  className={`group relative rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 ${
                    selectedDuration === 'monthly'
                      ? 'border-amber-400 bg-amber-50/50 shadow-lg shadow-amber-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-semibold text-navy">Monthly</span>
                    <Badge className="bg-emerald-500 text-white border-none text-[9px] px-1.5 py-0 rounded-md ml-auto">Best Value</Badge>
                  </div>
                  <p className="text-2xl font-bold text-navy">KES 500</p>
                  <p className="text-xs text-slate-400 mt-1">30 days premium visibility</p>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                <p className="text-xs font-semibold text-navy flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Premium Shop Benefits
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• All your listings appear first in search results</li>
                  <li>• Premium Shop badge on all your listings</li>
                  <li>• Priority placement in category & location pages</li>
                  <li>• Stand out from other sellers with the Premium badge</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promotion History */}
      {promotions.length > 0 && (
        <Card className="rounded-2xl border border-slate-100 shadow-premium">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" /> History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {promotions.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      p.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      {p.type === 'shop' ? (
                        <Star className={`h-4 w-4 ${p.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`} />
                      ) : (
                        <Megaphone className={`h-4 w-4 ${p.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {p.type === 'shop' ? 'Shop Promotion' : 'Listing Promotion'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.duration} · KES {p.amount} · {new Date(p.startDate).toLocaleDateString()} – {new Date(p.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    p.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : p.status === 'expired'
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promote a listing section */}
      <Card className="rounded-2xl border border-slate-100 shadow-premium bg-gradient-to-br from-royal/5 to-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal/10">
                <Package className="h-7 w-7 text-royal" />
              </div>
              <div>
                <p className="text-lg font-bold text-navy">Promote a Single Listing</p>
                <p className="text-sm text-slate-400 mt-0.5">Get more eyes on a specific listing</p>
              </div>
            </div>
            <Button className="rounded-xl bg-royal hover:bg-royal/90 text-white border-0 shadow-lg shadow-royal/20 shrink-0" asChild>
              <a href="/dashboard/listings"><Zap className="h-4 w-4 mr-1.5" /> Go to My Listings</a>
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            From your listings page, open the dropdown menu on any listing and select &quot;Promote / Feature&quot; to promote a single listing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
