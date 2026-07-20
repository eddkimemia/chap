'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/api-client'

export default function RegisterPage() {
  const router = useRouter()
  const { setCurrentUser, clearLegacyAuthStorage } = useAppStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })

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
      .catch(() => {})
  }, [router, setCurrentUser, clearLegacyAuthStorage])

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Please fill in all fields')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    if (!agreeTerms) return toast.error('You must agree to the terms and conditions')

    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      setCurrentUser(data.user)
      clearLegacyAuthStorage()
      toast.success('Account created successfully!')

      router.push(`/verify-email?userId=${data.user.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-royal/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-orange/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md glass-card shadow-premium-xl relative z-10 rounded-3xl border-0">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg mb-4 overflow-hidden">
              <Image src="/logoicon.png" alt="ChapKE" width={40} height={40} className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">Create Account</h1>
            <p className="text-muted-foreground mt-1 text-sm">Join ChapKE and start trading</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-navy font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Your full name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="h-12 rounded-2xl pl-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-navy font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="h-12 rounded-2xl pl-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-navy font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="h-12 rounded-2xl pl-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-navy font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={(e) => updateForm('password', e.target.value)} className="h-12 rounded-2xl pl-11 pr-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {['8+ chars', 'Uppercase', 'Number'].map((req) => (
                  <span key={req} className={`text-[10px] px-2 py-0.5 rounded-full ${form.password.length >= 8 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{req}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-navy font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} className={`h-12 rounded-2xl pl-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300' : ''}`} required />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-red-500">Passwords do not match</p>}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} className="mt-1 rounded-md" />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-royal font-medium hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-royal font-medium hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-royal text-white font-semibold shadow-lg shadow-royal/20 hover:shadow-royal/30 transition-all border-0">
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span> <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">or continue with</span>
          </div>

          <Button variant="outline" className="w-full h-11 rounded-2xl border-slate-200 gap-2 text-sm" onClick={() => toast.info('Google sign-up coming soon')}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-royal hover:text-royal/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
