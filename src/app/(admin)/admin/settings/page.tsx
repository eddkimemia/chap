'use client'

import { useState, useEffect } from 'react'
import { Save, Settings2, Building2, Mail, Shield, Bell, Palette, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

export default function AdminSystemSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_name: 'ChapKE', site_description: '', support_email: '', support_phone: '', support_hours: '',
    address: '', city: '', currency: 'KES', currency_symbol: 'KSh', date_format: 'DD/MM/YYYY', timezone: 'Africa/Nairobi',
    listings_require_approval: false, max_images_per_listing: 10, max_videos_per_listing: 3, listing_duration_days: 30,
    allow_guest_browsing: true, require_phone_verification: true, enable_messaging: true, enable_reviews: true,
    maintenance_mode: false, registration_enabled: true,
    email_sender_name: '', email_sender_address: '', smtp_host: '', smtp_port: 587, smtp_user: '', smtp_pass: '',
    site_primary_color: '#2563eb', site_secondary_color: '#f97316', site_logo_url: '', site_favicon_url: '',
    facebook_url: '', twitter_url: '', instagram_url: '', youtube_url: '',
    app_store_url: '', play_store_url: '',
  })

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/admin/settings')
      if (res.ok) { const data = await res.json(); setSettings((prev) => ({ ...prev, ...data })) }
    } catch (error) { console.error('Failed to fetch settings:', error) } finally { setLoading(false) }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT', body: JSON.stringify(settings),
      })
      if (res.ok) toast.success('Settings saved')
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-6 lg:pl-6">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure platform-wide settings</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="rounded-2xl bg-royal text-white border-0"><Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save All'}</Button>
      </div>

      {/* General */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Settings2 className="h-4 w-4 text-royal" /> General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Site Name</Label><Input value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Site Description</Label><Input value={settings.site_description} onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Currency</Label><Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}><SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl"><SelectItem value="KES">KES</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Currency Symbol</Label><Input value={settings.currency_symbol} onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Date Format</Label><Select value={settings.date_format} onValueChange={(v) => setSettings({ ...settings, date_format: v })}><SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl"><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem><SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Timezone</Label><Input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Building2 className="h-4 w-4 text-royal" /> Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Support Email</Label><Input value={settings.support_email} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Support Phone</Label><Input value={settings.support_phone} onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Support Hours</Label><Input value={settings.support_hours} onChange={(e) => setSettings({ ...settings, support_hours: e.target.value })} placeholder="Mon-Fri 8am-5pm" className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">City</Label><Input value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
          <div className="space-y-2"><Label className="text-xs font-medium text-navy">Address</Label><Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="rounded-xl h-10" /></div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><svg className="h-4 w-4 text-royal" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Social Media</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Facebook URL</Label><Input value={settings.facebook_url} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} placeholder="https://facebook.com/chapke" className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Twitter URL</Label><Input value={settings.twitter_url} onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })} placeholder="https://twitter.com/chapke" className="rounded-xl h-10" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Instagram URL</Label><Input value={settings.instagram_url} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} placeholder="https://instagram.com/chapke" className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">YouTube URL</Label><Input value={settings.youtube_url} onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })} placeholder="https://youtube.com/@chapke" className="rounded-xl h-10" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile App */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Smartphone className="h-4 w-4 text-royal" /> Mobile App</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">App Store URL</Label><Input value={settings.app_store_url} onChange={(e) => setSettings({ ...settings, app_store_url: e.target.value })} placeholder="https://apps.apple.com/..." className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Play Store URL</Label><Input value={settings.play_store_url} onChange={(e) => setSettings({ ...settings, play_store_url: e.target.value })} placeholder="https://play.google.com/..." className="rounded-xl h-10" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Shield className="h-4 w-4 text-royal" /> Listing Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Max Images</Label><Input type="number" value={settings.max_images_per_listing} onChange={(e) => setSettings({ ...settings, max_images_per_listing: parseInt(e.target.value) || 1 })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Max Videos</Label><Input type="number" value={settings.max_videos_per_listing} onChange={(e) => setSettings({ ...settings, max_videos_per_listing: parseInt(e.target.value) || 0 })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Duration (days)</Label><Input type="number" value={settings.listing_duration_days} onChange={(e) => setSettings({ ...settings, listing_duration_days: parseInt(e.target.value) || 30 })} className="rounded-xl h-10" /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2"><Switch checked={settings.listings_require_approval} onCheckedChange={(v) => setSettings({ ...settings, listings_require_approval: v })} /><Label className="text-xs font-medium">Require approval</Label></div>
            <div className="flex items-center gap-2"><Switch checked={settings.require_phone_verification} onCheckedChange={(v) => setSettings({ ...settings, require_phone_verification: v })} /><Label className="text-xs font-medium">Require phone verification</Label></div>
            <div className="flex items-center gap-2"><Switch checked={settings.enable_messaging} onCheckedChange={(v) => setSettings({ ...settings, enable_messaging: v })} /><Label className="text-xs font-medium">Enable messaging</Label></div>
            <div className="flex items-center gap-2"><Switch checked={settings.enable_reviews} onCheckedChange={(v) => setSettings({ ...settings, enable_reviews: v })} /><Label className="text-xs font-medium">Enable reviews</Label></div>
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-royal" /> Email Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Sender Name</Label><Input value={settings.email_sender_name} onChange={(e) => setSettings({ ...settings, email_sender_name: e.target.value })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Sender Address</Label><Input value={settings.email_sender_address} onChange={(e) => setSettings({ ...settings, email_sender_address: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">SMTP Host</Label><Input value={settings.smtp_host} onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">SMTP Port</Label><Input type="number" value={settings.smtp_port} onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) || 587 })} className="rounded-xl h-10" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">SMTP User</Label><Input value={settings.smtp_user} onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">SMTP Password</Label><Input type="password" value={settings.smtp_pass} onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Palette className="h-4 w-4 text-royal" /> Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Primary Color</Label><div className="flex gap-2"><Input type="color" value={settings.site_primary_color} onChange={(e) => setSettings({ ...settings, site_primary_color: e.target.value })} className="w-12 h-10 p-1 rounded-xl" /><Input value={settings.site_primary_color} onChange={(e) => setSettings({ ...settings, site_primary_color: e.target.value })} className="rounded-xl h-10 flex-1" /></div></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Secondary Color</Label><div className="flex gap-2"><Input type="color" value={settings.site_secondary_color} onChange={(e) => setSettings({ ...settings, site_secondary_color: e.target.value })} className="w-12 h-10 p-1 rounded-xl" /><Input value={settings.site_secondary_color} onChange={(e) => setSettings({ ...settings, site_secondary_color: e.target.value })} className="rounded-xl h-10 flex-1" /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Logo URL</Label><Input value={settings.site_logo_url} onChange={(e) => setSettings({ ...settings, site_logo_url: e.target.value })} className="rounded-xl h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-medium text-navy">Favicon URL</Label><Input value={settings.site_favicon_url} onChange={(e) => setSettings({ ...settings, site_favicon_url: e.target.value })} className="rounded-xl h-10" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Bell className="h-4 w-4 text-royal" /> System Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2"><Switch checked={settings.maintenance_mode} onCheckedChange={(v) => setSettings({ ...settings, maintenance_mode: v })} /><Label className="text-xs font-medium">Maintenance Mode</Label></div>
            <div className="flex items-center gap-2"><Switch checked={settings.registration_enabled} onCheckedChange={(v) => setSettings({ ...settings, registration_enabled: v })} /><Label className="text-xs font-medium">User Registration</Label></div>
            <div className="flex items-center gap-2"><Switch checked={settings.allow_guest_browsing} onCheckedChange={(v) => setSettings({ ...settings, allow_guest_browsing: v })} /><Label className="text-xs font-medium">Guest Browsing</Label></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
