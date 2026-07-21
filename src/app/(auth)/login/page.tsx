'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/api-client'
import { Eye, EyeOff, Mail, Phone, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

function safeRedirectPath(raw: string | null): string {
  if (!raw) return '/dashboard'
  // Same-origin relative paths only — block open redirects
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) {
    return '/dashboard'
  }
  return raw
}

export default function LoginPage() {
  const router = useRouter()
  const { setCurrentUser, clearLegacyAuthStorage } = useAppStore()

  useEffect(() => {
    clearLegacyAuthStorage()
    apiFetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user)
          router.replace('/dashboard')
        }
      })
      .catch(() => { /* not authenticated — expected */ })
  }, [router, setCurrentUser, clearLegacyAuthStorage])

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'email' | 'phone'>('email')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) return toast.error('Please fill in all fields')
    setLoading(true)

    try {
      const isEmail = identifier.includes('@')
      const body = isEmail ? { email: identifier, password } : { phone: identifier, password }

      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403) {
          if (data.lockoutUntil) {
            toast.error(`Account locked. Try again after ${new Date(data.lockoutUntil).toLocaleTimeString()}`)
          } else {
            toast.error(data.error || 'Account access denied')
          }
        } else {
          toast.error(data.error || 'Login failed')
        }
        return
      }

      if (data.requiresTwoFactor) {
        sessionStorage.setItem('2fa_temp_token', data.tempToken)
        sessionStorage.setItem('2fa_method', data.method || 'app')
        sessionStorage.setItem('2fa_destination', data.maskedDestination || '')
        router.push('/2fa')
        return
      }

      setCurrentUser(data.user)
      clearLegacyAuthStorage()
      toast.success('Welcome back!')

      const params = new URLSearchParams(window.location.search)
      router.push(safeRedirectPath(params.get('redirect')))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-royal/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-red/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md glass-card shadow-premium-xl relative z-10 rounded-3xl border-0">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg mb-4 overflow-hidden">
              <Image src="/logoicon.png" alt="ChapKE" width={40} height={40} className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to ChapKE to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <Input type={mode === 'email' ? 'email' : 'tel'} placeholder={mode === 'email' ? 'you@example.com' : '+254 7XX XXX XXX'} value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 rounded-2xl pl-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-navy font-medium">Password</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-royal hover:text-royal/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-2xl pl-11 pr-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-royal text-white font-semibold shadow-lg shadow-royal/20 hover:shadow-royal/30 transition-all border-0">
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span> <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">or continue with</span>
          </div>

          <Button variant="outline" className="w-full h-11 rounded-2xl border-slate-200 gap-2 text-sm" onClick={() => toast.info('Google sign-in coming soon')}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-royal hover:text-royal/80 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
