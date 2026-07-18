'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle2, RefreshCw, ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  InputOTP, InputOTPGroup, InputOTPSlot,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') || ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (userId) return
    apiFetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.email) toast.info('Verify your email to unlock all features')
        else if (data?.user) router.push('/dashboard')
      })
      .catch(() => {})
  }, [userId, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return toast.error('Enter the 6-digit code')
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, type: 'email', userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setVerified(true)
      toast.success('Email verified!')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await apiFetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend')
      if (data.devCode) setCode(data.devCode)
      toast.success('Code resent!')
    } catch (err: any) { toast.error(err.message) } finally { setResending(false) }
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md glass-card shadow-premium-xl rounded-3xl border-0">
          <CardContent className="p-8 sm:p-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-navy">Email Verified!</h1>
            <p className="text-muted-foreground mt-1 text-sm">Your email has been verified successfully.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-6 rounded-2xl bg-royal border-0 shadow-lg shadow-royal/20">
              Go to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md glass-card shadow-premium-xl rounded-3xl border-0">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-royal text-white shadow-lg shadow-royal/20 mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">Verify Your Email</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Enter the 6-digit code sent to your email address
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex justify-center py-4">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className="w-10 h-12 text-lg rounded-lg border-slate-200" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-12 rounded-2xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Verify Email</>}
            </Button>

            <div className="text-center">
              <button type="button" onClick={handleResend} disabled={resending} className="inline-flex items-center gap-1 text-sm text-royal font-medium hover:text-royal/80 disabled:text-slate-300">
                <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} /> Resend Code
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">Verifying your email helps us keep your account secure and enables you to receive important notifications.</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-navy transition-colors">
              Skip for now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="h-8 w-8 border-3 border-royal/30 border-t-royal rounded-full animate-spin" /></div>}>
    <VerifyEmailContent />
  </Suspense>
}
