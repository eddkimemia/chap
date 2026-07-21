'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Edit3, Trash2, Image as ImageIcon, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface Banner {
  id: string; title: string; imageUrl: string; linkUrl: string; position: string; isActive: boolean; startDate: string | null; endDate: string | null; clicks: number; impressions: number; order: number
}

export default function AdminAdvertisementsPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Banner | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'home', isActive: true, startDate: '', endDate: '', order: 0 })

  useEffect(() => { fetchBanners() }, [])

  const fetchBanners = async () => {
    try {
      const res = await apiFetch('/api/admin/banners')
      if (res.ok) setBanners(await res.json())
    } catch (error) { console.error('Failed to fetch banners:', error) } finally { setLoading(false) }
  }

  const saveBanner = async () => {
    try {
      const body = { ...form, startDate: form.startDate || null, endDate: form.endDate || null }
      const res = editing
        ? await apiFetch(`/api/admin/banners/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : await apiFetch('/api/admin/banners', { method: 'POST', body: JSON.stringify(body) })
      if (res.ok) { toast.success(editing ? 'Banner updated' : 'Banner created'); setDialogOpen(false); fetchBanners() }
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    try {
      const res = await apiFetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchBanners() }
    } catch { toast.error('Failed to delete') }
  }

  const openEdit = (b: Banner) => {
    setEditing(b); setForm({ title: b.title, imageUrl: b.imageUrl, linkUrl: b.linkUrl, position: b.position, isActive: b.isActive, startDate: b.startDate ? b.startDate.slice(0, 10) : '', endDate: b.endDate ? b.endDate.slice(0, 10) : '', order: b.order }); setDialogOpen(true)
  }

  const openNew = () => {
    setEditing(null); setForm({ title: '', imageUrl: '', linkUrl: '', position: 'home', isActive: true, startDate: '', endDate: '', order: 0 }); setDialogOpen(true)
  }

  const filtered = banners.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Advertisements</h1>
          <p className="text-sm text-muted-foreground mt-1">{banners.length} banners and ads</p>
        </div>
        <Button onClick={openNew} className="rounded-2xl bg-royal text-white border-0"><Plus className="h-4 w-4 mr-1" /> New Banner</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search banners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 rounded-2xl h-11 bg-white border-slate-200" />
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Banner</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Position</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Performance</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Schedule</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-4 w-40" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell><TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell></TableRow>
              )) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><ImageIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p>No banners found</p></TableCell></TableRow>
              ) : filtered.map((b) => (
                <TableRow key={b.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <div className="h-full flex items-center justify-center text-slate-300"><ImageIcon className="h-4 w-4" /></div>}
                      </div>
                      <div><p className="text-sm font-semibold text-navy">{b.title}</p><p className="text-xs text-muted-foreground truncate max-w-[200px]">{b.linkUrl || 'No link'}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] rounded-lg">{b.position}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground"><Eye className="h-3 w-3 inline mr-1" />{b.impressions} · {b.clicks} clicks</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Always'}{b.endDate ? ` → ${new Date(b.endDate).toLocaleDateString()}` : ''}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${b.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{b.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(b)} className="rounded-lg"><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteBanner(b.id)} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader><DialogTitle className="text-navy text-xl font-bold">{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Image URL</Label>
              <div className="flex gap-2">
                <Input value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setPreviewUrl(e.target.value) }} placeholder="https://..." className="rounded-xl h-10 flex-1" />
                {previewUrl && <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden shrink-0"><img src={previewUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Link URL</Label>
              <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." className="rounded-xl h-10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Position</Label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="home">Home Page</option><option value="category">Category Page</option><option value="sidebar">Sidebar</option><option value="listing">Listing Page</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label className="text-xs font-medium text-navy">Active</Label>
            </div>
            <Button onClick={saveBanner} className="w-full rounded-2xl bg-royal text-white border-0">{editing ? 'Update' : 'Create'} Banner</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
