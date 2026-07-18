'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, CheckCircle2, RefreshCw, Smartphone, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  InputOTP, InputOTPGroup, InputOTPSlot,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/api-client'

export default function TwoFactorPage() {
  const router = useRouter()
  const { setCurrentUser, clearLegacyAuthStorage } = useAppStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<string>('app')
  const [destination, setDestination] = useState<string>('')
  const tempToken = typeof window !== 'undefined' ? sessionStorage.getItem('2fa_temp_token') : null

  useEffect(() => {
    if (!tempToken) {
      toast.error('Session expired. Please login again.')
      router.push('/login')
      return
    }
    const m = sessionStorage.getItem('2fa_method') || 'app'
    const d = sessionStorage.getItem('2fa_destination') || ''
    setMethod(m)
    setDestination(d)

    if (m !== 'app') {
      apiFetch('/api/auth/2fa', {
        method: 'POST',
        body: JSON.stringify({ method: m, tempToken }),
      }).then(async (res) => {
      const data = await res.json()
        if (data.devCode) setCode(data.devCode)
      }).catch(() => toast.error('Failed to check 2FA status'))
    }
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return toast.error('Enter the 6-digit code')
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code, tempToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code')

      setCurrentUser(data.user)
      clearLegacyAuthStorage()
      sessionStorage.removeItem('2fa_temp_token')
      sessionStorage.removeItem('2fa_method')
      sessionStorage.removeItem('2fa_destination')
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try {
      const res = await apiFetch('/api/auth/2fa', {
        method: 'POST',
        body: JSON.stringify({ method, tempToken }),
      })
      const data = await res.json()
      if (data.devCode) setCode(data.devCode)
      toast.success('Code resent!')
    } catch { toast.error('Failed to resend code') }
  }

  if (!tempToken) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md glass-card shadow-premium-xl rounded-3xl border-0">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-royal text-white shadow-lg shadow-royal/20 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">Two-Factor Auth</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {method === 'app'
                ? 'Enter the code from your authenticator app'
                : destination
                  ? `Enter the code sent to ${destination}`
                  : 'Enter the verification code'}
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
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Verify & Sign In</>}
            </Button>

            <div className="flex items-center justify-between text-sm">
              {method !== 'app' && (
                <button type="button" onClick={handleResend} className="inline-flex items-center gap-1 text-royal font-medium hover:text-royal/80">
                  <RefreshCw className="h-3.5 w-3.5" /> Resend
                </button>
              )}
              <Link href="/login" className="text-muted-foreground hover:text-navy transition-colors">
                Back to login
              </Link>
            </div>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-2">
              <Key className="h-4 w-4 text-royal mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Having trouble? Contact support at{' '}
                <a href="mailto:support@chap.co.ke" className="text-royal font-medium">support@chap.co.ke</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
