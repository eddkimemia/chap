'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'

export default function AdminLoginPage() {
  const router = useRouter()
  const { setCurrentUser } = useAppStore()
  const [email, setEmail] = useState('admin@chapke.co.ke')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }

      setCurrentUser(data.user)
      toast.success('Welcome back, Admin!')
      router.push('/admin')
    } catch {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 rounded-3xl border-0 shadow-2xl">
        <CardContent className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-blue-600 shadow-lg mb-4 overflow-hidden">
              <img src="/logoicon.png" alt="ChapKE" className="h-10 w-10 object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to manage ChapKE</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-navy font-medium">Admin Email</Label>
              <Input
                type="email"
                placeholder="admin@chapke.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-navy font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl pl-11 pr-11 bg-white/80 border-slate-200 focus:border-royal/30 focus:ring-royal/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-500 to-blue-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all border-0"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In to Admin</span> <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Default: admin@chapke.co.ke / admin123
            </p>
            <a href="/login" className="text-xs font-medium text-royal hover:text-royal/80 transition-colors">
              Back to User Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
