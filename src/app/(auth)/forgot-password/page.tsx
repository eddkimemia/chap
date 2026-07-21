'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, ArrowLeft, Send, CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  InputOTP, InputOTPGroup, InputOTPSlot,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'send' | 'verify' | 'reset'>('send')
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier) return toast.error('Please enter your email or phone')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'email' ? { email: identifier } : { phone: identifier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send code')
      if (data.devCode) setCode(data.devCode)
      if (data.userId) setUserId(data.userId)
      toast.success('Reset code sent! Check your device.')
      setStep('verify')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally { setLoading(false) }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return toast.error('Enter the 6-digit code')
    setStep('reset')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const resetBody: Record<string, string> = { token: code, password }
      if (userId) resetBody.userId = userId
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetBody),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md glass-card shadow-premium-xl rounded-3xl border-0">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-royal text-white font-bold text-xl shadow-lg shadow-royal/20 mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">
              {step === 'send' ? 'Forgot Password' : step === 'verify' ? 'Enter Reset Code' : 'Reset Password'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {step === 'send' ? "We'll send you a reset code" : step === 'verify' ? `Check your ${mode} for the code` : 'Choose a new password'}
            </p>
          </div>

          {step === 'send' && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="flex rounded-2xl bg-muted p-1">
                <button type="button" onClick={() => setMode('email')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${mode === 'email' ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy'}`}>
                  <Mail className="h-4 w-4" /> Email
                </button>
                <button type="button" onClick={() => setMode('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${mode === 'phone' ? 'bg-white text-navy shadow-sm' : 'text-muted-foreground hover:text-navy'}`}>
                  <Phone className="h-4 w-4" /> Phone
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-navy font-medium">{mode === 'email' ? 'Email Address' : 'Phone Number'}</Label>
                <div className="relative">
                  {mode === 'email' ? <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> : <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                  <Input type={mode === 'email' ? 'email' : 'tel'} placeholder={mode === 'email' ? 'you@example.com' : '+254 7XX XXX XXX'} value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 rounded-2xl pl-11 bg-white/80 border-slate-200" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Send Reset Code</>}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
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
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Verify Code</>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive it?{' '}
                <button type="button" onClick={handleSendCode} className="text-royal font-medium hover:underline">Resend</button>
              </p>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-navy font-medium">New Password</Label>
                <Input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-2xl bg-white/80 border-slate-200" required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label className="text-navy font-medium">Confirm New Password</Label>
                <Input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12 rounded-2xl bg-white/80 border-slate-200" required />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-royal font-medium hover:text-royal/80 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
