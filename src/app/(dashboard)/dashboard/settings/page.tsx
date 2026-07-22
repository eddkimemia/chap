'use client'

import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Lock, Camera, Save, Trash2, Bell, Shield,
  Eye, EyeOff, Loader2, Building2, BadgeCheck, Upload, FileText,
  MapPin, Globe, CheckCircle2, AlertCircle, Image as ImageIcon,
  Link2, Twitter, Facebook, Clock, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'

interface SettingsUser {
  id: string; name: string; email: string; phone: string; username: string;
  avatar: string; bio: string; role: string; isVerified: boolean;
  profile?: { address?: string; city?: string; country?: string };
  businessProfile?: { companyName?: string; industry?: string; taxId?: string; isVerified?: boolean };
  [key: string]: unknown;
}

export default function SettingsPage() {
  const { setCurrentUser, logout } = useAppStore()
  const [user, setUser] = useState<SettingsUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [verification, setVerification] = useState<{ verification: { status: string; reviewNote?: string } } | null>(null)
  const [verifyDialog, setVerifyDialog] = useState<{ type: 'email' | 'phone'; masked: string } | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)

  const [profile, setProfile] = useState({ name: '', bio: '', avatar: '', phone: '', email: '', username: '' })
  const [profileExtra, setProfileExtra] = useState({ city: '', country: 'Kenya', address: '' })
  const [socialLinks, setSocialLinks] = useState({ facebook: '', twitter: '', instagram: '', linkedin: '' })
  const [activeTab, setActiveTab] = useState('profile')
  const [business, setBusiness] = useState({
    companyName: '', description: '', industry: '', taxId: '', registrationNo: '',
    website: '', employeeCount: '', foundedYear: '', address: '',
  })
  const [kyc, setKyc] = useState({ idType: 'national_id', idNumber: '', idFrontUrl: '', idBackUrl: '', selfieUrl: '' })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [notifications, setNotifications] = useState({
    emailMessages: true, emailListings: true, emailPromotions: false, emailPriceAlerts: true,
    pushMessages: true, pushListings: true, smsMessages: false, whatsappMessages: false,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      apiFetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      apiFetch('/api/business-profile').then(r => r.ok ? r.json() : null),
      apiFetch('/api/notifications/preferences').then(r => r.ok ? r.json() : null),
      apiFetch('/api/verification').then(r => r.ok ? r.json() : null),
    ]).then(([userData, busData, notifData, verifData]) => {
      if (cancelled) return
      const u = userData?.user
      if (!u) return
      setUser(u)
      setCurrentUser(u)
      setProfile({ name: u.name || '', bio: u.bio || '', avatar: u.avatar || '', phone: u.phone || '', email: u.email || '', username: u.username || '' })
      setProfileExtra({ city: u.profile?.city || '', country: u.profile?.country || 'Kenya', address: u.profile?.address || '' })
      try { const sl = JSON.parse(u.profile?.socialLinks || '{}'); setSocialLinks({ facebook: sl.facebook || '', twitter: sl.twitter || '', instagram: sl.instagram || '', linkedin: sl.linkedin || '' }) } catch (error) { console.error('Failed to parse social links:', error) } 
      if (busData?.businessProfile) {
        const b = busData.businessProfile
        setBusiness({
          companyName: b.companyName || '', description: b.description || '', industry: b.industry || '',
          taxId: b.taxId || '', registrationNo: b.registrationNo || '', website: b.website || '',
          employeeCount: b.employeeCount || '', foundedYear: b.foundedYear?.toString() || '', address: b.address || '',
        })
        if (b.socialLinks) {
          try { const sl = JSON.parse(typeof b.socialLinks === 'string' ? b.socialLinks : '{}'); setSocialLinks((prev) => ({ ...prev, ...sl })) } catch {}
        }
      }
      if (notifData?.preferences) {
        setNotifications((prev) => ({ ...prev, ...notifData.preferences }))
      }
      setVerification(verifData)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [setCurrentUser])

  const handleProfileSave = async () => {
    if (!profile.name.trim()) return toast.error('Name is required')
    setSaving('profile')
    try {
      const res = await apiFetch('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ ...profile, ...profileExtra, socialLinks }),
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setCurrentUser(data.user)
        if (data.user?.role === 'business') {
          await apiFetch('/api/business-profile', {
            method: 'PUT',
            body: JSON.stringify({ socialLinks }),
          })
        }
        if (data.pendingVerification && data.maskedDestination) {
          setVerifyDialog({ type: data.pendingVerification, masked: data.maskedDestination })
          setVerifyCode('')
        } else {
          toast.success('Profile updated')
        }
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Failed to update profile')
      }
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(null) }
  }

  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 6) return toast.error('Enter the 6-digit code')
    setVerifying(true)
    try {
      const res = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ code: verifyCode, type: verifyDialog!.type }),
      })
      if (res.ok) {
        toast.success(`${verifyDialog!.type} verified successfully`)
        setVerifyDialog(null)
        setVerifyCode('')
        const userRes = await apiFetch('/api/auth/me')
        if (userRes.ok) {
          const data = await userRes.json()
          setUser(data.user)
          setCurrentUser(data.user)
          setProfile({ name: data.user.name || '', bio: data.user.bio || '', avatar: data.user.avatar || '', phone: data.user.phone || '', email: data.user.email || '', username: data.user.username || '' })
          setProfileExtra({ city: data.user.profile?.city || '', country: data.user.profile?.country || 'Kenya', address: data.user.profile?.address || '' })
          try { const sl = JSON.parse(data.user.profile?.socialLinks || '{}'); setSocialLinks({ facebook: sl.facebook || '', twitter: sl.twitter || '', instagram: sl.instagram || '', linkedin: sl.linkedin || '' }) } catch (error) { console.error('Failed to parse social links:', error) } 
        }
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Invalid code')
      }
    } catch { toast.error('Verification failed') }
    finally { setVerifying(false) }
  }

  const handleResendCode = async () => {
    setSendingCode(true)
    try {
      const res = await apiFetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ type: verifyDialog!.type }),
      })
      if (res.ok) toast.success('Code resent')
      else { const d = await res.json(); toast.error(d.error || 'Failed to resend') }
    } catch { toast.error('Failed to resend') }
    finally { setSendingCode(false) }
  }

  const handleBusinessSave = async () => {
    setSaving('business')
    try {
      const res = await apiFetch('/api/business-profile', {
        method: 'PUT',
        body: JSON.stringify({ ...business, socialLinks }),
      })
      if (res.ok) {
        const userRes = await apiFetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
          setCurrentUser(userData.user)
        }
        toast.success('Business profile saved')
      }
      else { const d = await res.json(); toast.error(d.error || 'Failed to save') }
    } catch { toast.error('Failed to save business profile') }
    finally { setSaving(null) }
  }

  const handleKycSubmit = async () => {
    if (!kyc.idNumber) return toast.error('ID number is required')
    if (!profileComplete) return toast.error('Complete all required Profile fields first')
    if (!businessComplete) return toast.error('Complete all required Business fields first')

    setSaving('kyc')
    try {
      const saves: Promise<Response>[] = []
      saves.push(
        apiFetch('/api/auth/me', {
          method: 'PUT',
          body: JSON.stringify({ ...profile, ...profileExtra, socialLinks }),
        })
      )
      saves.push(
        apiFetch('/api/business-profile', {
          method: 'PUT',
          body: JSON.stringify({ ...business, socialLinks }),
        })
      )
      const results = await Promise.allSettled(saves)
      if (results.some(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok))) {
        toast.error('Failed to save profile data')
        setSaving(null)
        return
      }

      const res = await apiFetch('/api/verification', {
        method: 'POST',
        body: JSON.stringify(kyc),
      })
      if (res.ok) {
        const data = await res.json()
        setVerification((prev: { verification: { status: string; reviewNote?: string } } | null) => ({ ...prev, verification: data.verification }))
        const userRes = await apiFetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
          setCurrentUser(userData.user)
        }
        toast.success('Verification documents submitted for review')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to submit')
      }
    } catch { toast.error('Failed to submit verification') }
    finally { setSaving(null) }
  }

  const handleDocUpload = async (file: File, field: 'idFrontUrl' | 'idBackUrl' | 'selfieUrl') => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await apiFetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setKyc((p) => ({ ...p, [field]: data.url }))
        toast.success('File uploaded')
      } else toast.error('Upload failed')
    } catch { toast.error('Upload failed') }
  }

  const handleNotifSave = async () => {
    setSaving('notif')
    try {
      const res = await apiFetch('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(notifications),
      })
      if (res.ok) toast.success('Preferences saved')
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save preferences') }
    finally { setSaving(null) }
  }

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new) return toast.error('Fill in all fields')
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match')
    if (passwords.new.length < 8) return toast.error('Password must be at least 8 characters')
    setSaving('password')
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      })
      if (res.ok) {
        setPasswords({ current: '', new: '', confirm: '' })
        toast.success('Password changed — other sessions signed out')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
    } catch { toast.error('Failed to change password') }
    finally { setSaving(null) }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try {
      const res = await apiFetch('/api/auth/me', { method: 'DELETE' })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete account'); return }
      await logout()
      window.location.href = '/login'
    } catch { toast.error('Failed to delete account') }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto space-y-6 lg:pl-6"><Skeleton className="h-8 w-32" /><Skeleton className="h-80 w-full rounded-2xl" /></div>
  }

  const verifStatus = verification?.verification?.status
  const isVerified = user?.isVerified
  const profileComplete = !!(user?.name && user?.username && user?.email && user?.phone && user?.profile?.address)
  const businessComplete = !!(user?.businessProfile?.companyName && user?.businessProfile?.industry && user?.businessProfile?.taxId)
  const allRequiredComplete = profileComplete && businessComplete && !!kyc.idType && !!kyc.idNumber && !!kyc.idFrontUrl && !!kyc.idBackUrl && !!kyc.selfieUrl

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:pl-6">
      <h1 className="text-2xl font-bold text-navy tracking-tight">Settings</h1>

      {/* Verification steps progress */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { step: 1, label: 'Profile', desc: 'Name, username, email, phone, address', tab: 'profile', done: profileComplete },
          { step: 2, label: 'Business', desc: 'Business name, industry, tax ID', tab: 'business', done: businessComplete },
          { step: 3, label: 'KYC', desc: 'ID & documents', tab: 'kyc', done: isVerified },
        ].map((s) => {
          const isCurrentTab = activeTab === s.tab
          return (
            <button key={s.step} onClick={() => setActiveTab(s.tab as 'profile' | 'business' | 'kyc' | 'notifications' | 'security')} className={`p-4 rounded-xl border text-left transition-all ${isCurrentTab ? 'bg-royal/5 border-royal/30 shadow-sm' : s.done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center gap-3 mb-1">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.done ? 'bg-emerald-500 text-white' : isCurrentTab ? 'bg-royal text-white' : 'bg-slate-300 text-white'}`}>
                  {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.step}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCurrentTab ? 'text-royal' : 'text-navy'}`}>{s.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.done ? 'Completed' : s.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="rounded-2xl bg-muted p-1 h-auto flex-wrap">
          <TabsTrigger value="profile" className="rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="business" className="rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Building2 className="h-4 w-4" /> Business</TabsTrigger>
          <TabsTrigger value="kyc" className="rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><BadgeCheck className="h-4 w-4" /> KYC</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Shield className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-royal flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      profile.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 h-7 w-7 bg-white rounded-full shadow-md flex items-center justify-center border border-border cursor-pointer">
                    <Camera className="h-3.5 w-3.5 text-navy" />
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const fd = new FormData()
                      fd.append('file', f)
                      const res = await apiFetch('/api/upload', { method: 'POST', body: fd })
                      if (res.ok) { const d = await res.json(); setProfile((p) => ({ ...p, avatar: d.url })) }
                    }} />
                  </label>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy">{user?.name}</p>
                    {isVerified && <BadgeCheck className="h-4 w-4 text-royal" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Full Name <span className="text-red-400">*</span></Label>
                  <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="h-11 rounded-xl bg-white border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Username <span className="text-red-400">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value.replace(/[^a-z0-9_-]/g, '').toLowerCase() }))} placeholder="username" className="h-11 rounded-xl bg-white border-slate-200 pl-8" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">URL: {(process.env.NEXT_PUBLIC_SITE_URL || 'https://chap.co.ke').replace(/^https?:\/\//, '')}/seller/{profile.username || 'username'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Email <span className="text-red-400">*</span></Label>
                  <Input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} type="email" className="h-11 rounded-xl bg-white border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Phone <span className="text-red-400">*</span></Label>
                  <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} type="tel" className="h-11 rounded-xl bg-white border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">City</Label>
                  <Input value={profileExtra.city} onChange={(e) => setProfileExtra((p) => ({ ...p, city: e.target.value }))} placeholder="Nairobi" className="h-11 rounded-xl bg-white border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Country</Label>
                  <Input value={profileExtra.country} onChange={(e) => setProfileExtra((p) => ({ ...p, country: e.target.value }))} className="h-11 rounded-xl bg-white border-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-navy font-medium">Address <span className="text-red-400">*</span></Label>
                <Input value={profileExtra.address} onChange={(e) => setProfileExtra((p) => ({ ...p, address: e.target.value }))} placeholder="Physical address" className="h-11 rounded-xl bg-white border-slate-200" />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-bold text-navy mb-3">Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                    { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/...' },
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                  ].map((s) => (
                    <div key={s.key} className="space-y-2">
                      <Label className="text-navy font-medium">{s.label}</Label>
                      <Input value={(socialLinks as Record<string, string>)[s.key]} onChange={(e) => setSocialLinks((p) => ({ ...p, [s.key]: e.target.value }))} placeholder={s.placeholder} className="h-11 rounded-xl bg-white border-slate-200" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-navy font-medium">Bio</Label>
                <Textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} className="rounded-xl min-h-[80px] bg-white border-slate-200 resize-none" maxLength={300} />
                <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/300</p>
              </div>

              <p className="text-xs text-slate-400"><span className="text-red-400">*</span> Required fields</p>

              <Button onClick={handleProfileSave} disabled={saving === 'profile'} className="rounded-xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
                {saving === 'profile' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Profile */}
        <TabsContent value="business">
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-royal" />
                  <div>
                    <h3 className="text-navy font-bold">Business Profile</h3>
                    <p className="text-xs text-muted-foreground">Set up your business details for trust and credibility</p>
                  </div>
                </div>
                {user?.businessProfile?.isVerified && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 rounded-lg"><CheckCircle2 className="h-3.5 w-3.5" /> Business Verified</Badge>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Business Name <span className="text-red-400">*</span></Label>
                  <Input value={business.companyName} onChange={(e) => setBusiness((p) => ({ ...p, companyName: e.target.value }))} placeholder="Your business name" className="h-11 rounded-xl bg-white border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Industry <span className="text-red-400">*</span></Label>
                  <select value={business.industry} onChange={(e) => setBusiness((p) => ({ ...p, industry: e.target.value }))} className="h-11 w-full rounded-xl bg-white border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20">
                    <option value="">Select industry</option>
                    <option value="retail">Retail & Wholesale</option>
                    <option value="realestate">Real Estate</option>
                    <option value="automotive">Automotive</option>
                    <option value="electronics">Electronics & Tech</option>
                    <option value="fashion">Fashion & Beauty</option>
                    <option value="food">Food & Beverage</option>
                    <option value="services">Services</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Tax ID (KRA PIN) <span className="text-red-400">*</span></Label>
                  <Input value={business.taxId} onChange={(e) => setBusiness((p) => ({ ...p, taxId: e.target.value }))} placeholder="P051234567Z" className="h-11 rounded-xl bg-white border-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-navy font-medium">Description</Label>
                <Textarea value={business.description} onChange={(e) => setBusiness((p) => ({ ...p, description: e.target.value }))} placeholder="Describe your business" className="rounded-xl resize-none min-h-[60px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-navy font-medium">Address <span className="text-red-400">*</span></Label>
                <Input value={business.address} onChange={(e) => setBusiness((p) => ({ ...p, address: e.target.value }))} placeholder="Physical business address" className="h-11 rounded-xl bg-white border-slate-200" />
              </div>
              <p className="text-xs text-slate-400"><span className="text-red-400">*</span> Required fields</p>

              <Button onClick={handleBusinessSave} disabled={saving === 'business'} className="rounded-xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
                {saving === 'business' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Business Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Verification */}
        <TabsContent value="kyc">
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-royal" />
                  <div>
                    <h3 className="text-navy font-bold">Identity Verification (KYC)</h3>
                    <p className="text-xs text-muted-foreground">Get verified to unlock all features and build trust</p>
                  </div>
                </div>
                {isVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 rounded-lg"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</Badge>
                ) : verifStatus === 'pending' ? (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 rounded-lg"><Clock className="h-3.5 w-3.5" /> Pending Review</Badge>
                ) : verifStatus === 'rejected' ? (
                  <Badge className="bg-red-50 text-red-600 border-red-200 gap-1 rounded-lg"><AlertCircle className="h-3.5 w-3.5" /> Rejected</Badge>
                ) : (
                  <Badge className="bg-slate-50 text-slate-600 border-slate-200 gap-1 rounded-lg"><AlertCircle className="h-3.5 w-3.5" /> Not Verified</Badge>
                )}
              </div>
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">ID Type <span className="text-red-400">*</span></Label>
                  <select value={kyc.idType} onChange={(e) => setKyc((p) => ({ ...p, idType: e.target.value }))} disabled={verifStatus === 'pending'} className="h-11 w-full rounded-xl bg-white border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 disabled:opacity-50">
                    <option value="national_id">National ID Card</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Drivers License</option>
                    <option value="alien_id">Alien ID Card</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">ID Number <span className="text-red-400">*</span></Label>
                  <Input value={kyc.idNumber} onChange={(e) => setKyc((p) => ({ ...p, idNumber: e.target.value }))} placeholder="Enter your ID number" disabled={verifStatus === 'pending'} className="h-11 rounded-xl bg-white border-slate-200 disabled:opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'idFrontUrl', label: 'ID Front', desc: 'Upload front side' },
                  { key: 'idBackUrl', label: 'ID Back', desc: 'Upload back side' },
                  { key: 'selfieUrl', label: 'Selfie', desc: 'Take a selfie' },
                ].map((doc) => (
                  <div key={doc.key} className="space-y-2">
                    <Label className="text-navy font-medium">{doc.label} <span className="text-red-400">*</span></Label>
                    <label className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors ${kyc[doc.key as keyof typeof kyc] ? 'border-emerald-300 bg-emerald-50' : ''}`}>
                      {kyc[doc.key as keyof typeof kyc] ? (
                        <img src={kyc[doc.key as keyof typeof kyc] as string} alt={doc.label} className="h-full w-full object-contain rounded-lg" />
                      ) : (
                        <><Upload className="h-6 w-6 text-slate-300 mb-1" /><span className="text-[10px] text-slate-400">{doc.desc}</span></>
                      )}
                      <input type="file" accept="image/*" className="hidden" disabled={verifStatus === 'pending'}
                        onChange={async (e) => {
                          const f = e.target.files?.[0]
                          if (f) handleDocUpload(f, doc.key as 'idFrontUrl' | 'idBackUrl' | 'selfieUrl')
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>

              {verifStatus === 'rejected' && verification?.verification?.reviewNote && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Review feedback:</p>
                      <p className="text-xs text-red-700 mt-0.5">{verification.verification.reviewNote}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Why verify?</p>
                    <p className="text-xs text-amber-700 mt-0.5">Verified users get a verified badge, higher listing limits, priority support, and increased buyer trust. Your documents are encrypted and never shared.</p>
                  </div>
                </div>
              </div>

              {verifStatus !== 'pending' && (
                <Button onClick={handleKycSubmit} disabled={saving === 'kyc' || !allRequiredComplete} className="rounded-xl bg-royal text-white border-0 shadow-lg shadow-royal/20 disabled:opacity-50">
                  {saving === 'kyc' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Submit for Verification
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-navy font-bold">Email Notifications</h3>
                {[
                  { key: 'emailMessages', label: 'New messages', desc: 'Get notified when someone messages you' },
                  { key: 'emailListings', label: 'Listing updates', desc: 'Status changes on your listings' },
                  { key: 'emailPromotions', label: 'Marketing emails', desc: 'Tips, promotions, and news' },
                  { key: 'emailPriceAlerts', label: 'Price alerts', desc: 'When prices drop on saved items' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-navy">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-navy font-bold">Push Notifications</h3>
                {[
                  { key: 'pushMessages', label: 'New messages', desc: 'Instant notification for messages' },
                  { key: 'pushListings', label: 'Listing updates', desc: 'Push for listing status changes' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-navy">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-navy font-bold">SMS & WhatsApp</h3>
                {[
                  { key: 'smsMessages', label: 'SMS for messages', desc: 'Get SMS when you receive a message' },
                  { key: 'whatsappMessages', label: 'WhatsApp alerts', desc: 'Receive notifications via WhatsApp' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-navy">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))} />
                  </div>
                ))}
              </div>

              <Button onClick={handleNotifSave} disabled={saving === 'notif'} className="rounded-xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
                {saving === 'notif' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-navy font-bold">Change Password</h3>

              <div className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} className="h-11 rounded-xl pl-11 bg-white border-slate-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} className="h-11 rounded-xl pl-11 bg-white border-slate-200" minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} className="h-11 rounded-xl pl-11 bg-white border-slate-200" />
                  </div>
                </div>
              </div>

              <Button onClick={handlePasswordChange} disabled={saving === 'password'} className="rounded-xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
                {saving === 'password' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                Change Password
              </Button>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-red-600 font-bold">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="destructive" onClick={handleDeleteAccount} className="rounded-xl mt-2"><Trash2 className="h-4 w-4 mr-2" /> Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {verifyDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-royal/10 flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-royal" />
              </div>
              <h3 className="text-lg font-bold text-navy">Verify your {verifyDialog.type}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                A 6-digit code was sent to{' '}
                <span className="font-medium text-navy">{verifyDialog.masked}</span>
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-navy font-medium">Verification Code</Label>
              <Input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="h-12 text-center text-2xl tracking-widest rounded-xl bg-white border-slate-200"
                maxLength={6}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyCode() }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setVerifyDialog(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={verifying || verifyCode.length !== 6}
                className="flex-1 rounded-xl bg-royal text-white border-0 shadow-lg shadow-royal/20"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BadgeCheck className="h-4 w-4 mr-2" />}
                Verify
              </Button>
            </div>
            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={sendingCode}
                className="text-xs text-royal hover:underline disabled:opacity-50"
              >
                {sendingCode ? 'Sending...' : 'Resend code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
