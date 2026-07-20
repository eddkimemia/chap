'use client'

import { useState, useEffect } from 'react'
import { Search, Globe, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

export default function AdminSeoPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    seo_title: '', seo_description: '', seo_keywords: '', seo_og_image: '', seo_fb_app_id: '', seo_twitter_handle: '',
    google_analytics_id: '', google_tag_manager: '', google_verification: '', facebook_pixel: '',
    canonical_url: '', robots_txt: '', structured_data: '',
  })

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/admin/settings')
      if (res.ok) {
      const data = await res.json()
        setSettings((prev) => ({ ...prev, ...data }))
      }
    } catch {} finally { setLoading(false) }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) toast.success('SEO settings saved')
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-6 lg:pl-6">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">SEO Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage search engine optimization</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="rounded-2xl bg-royal text-white border-0"><Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save All'}</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Globe className="h-4 w-4 text-royal" /> Meta Tags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Site Title</Label>
              <Input value={settings.seo_title} onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })} placeholder="ChapKE - Kenya's #1 Marketplace" className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Meta Description</Label>
              <Textarea value={settings.seo_description} onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })} placeholder="Buy and sell anything in Kenya..." rows={3} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Keywords</Label>
              <Input value={settings.seo_keywords} onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })} placeholder="marketplace, buy, sell, Kenya" className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">OG Image URL</Label>
              <Input value={settings.seo_og_image} onChange={(e) => setSettings({ ...settings, seo_og_image: e.target.value })} placeholder="https://..." className="rounded-xl h-10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">FB App ID</Label>
                <Input value={settings.seo_fb_app_id} onChange={(e) => setSettings({ ...settings, seo_fb_app_id: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Twitter Handle</Label>
                <Input value={settings.seo_twitter_handle} onChange={(e) => setSettings({ ...settings, seo_twitter_handle: e.target.value })} placeholder="@chapke" className="rounded-xl h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader><CardTitle className="text-navy text-base font-bold flex items-center gap-2"><Search className="h-4 w-4 text-royal" /> Tracking & Verification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Google Analytics ID</Label>
              <Input value={settings.google_analytics_id} onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })} placeholder="G-XXXXXXXXXX" className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Google Tag Manager</Label>
              <Input value={settings.google_tag_manager} onChange={(e) => setSettings({ ...settings, google_tag_manager: e.target.value })} placeholder="GTM-XXXXXXX" className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Google Site Verification</Label>
              <Input value={settings.google_verification} onChange={(e) => setSettings({ ...settings, google_verification: e.target.value })} placeholder="google-site-verification=..." className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Facebook Pixel ID</Label>
              <Input value={settings.facebook_pixel} onChange={(e) => setSettings({ ...settings, facebook_pixel: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Canonical URL</Label>
              <Input value={settings.canonical_url} onChange={(e) => setSettings({ ...settings, canonical_url: e.target.value })} placeholder="https://chap.co.ke" className="rounded-xl h-10" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium">
        <CardHeader><CardTitle className="text-navy text-base font-bold">Advanced</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-navy">robots.txt</Label>
            <Textarea value={settings.robots_txt} onChange={(e) => setSettings({ ...settings, robots_txt: e.target.value })} rows={4} className="rounded-xl font-mono text-xs" placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-navy">Structured Data (JSON-LD)</Label>
            <Textarea value={settings.structured_data} onChange={(e) => setSettings({ ...settings, structured_data: e.target.value })} rows={6} className="rounded-xl font-mono text-xs" placeholder='{"@context": "https://schema.org", ...}' />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
