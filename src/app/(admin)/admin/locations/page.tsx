'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Edit3, Trash2, MapPin } from 'lucide-react'
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

interface Location {
  id: string; name: string; slug: string; parentId: string | null; latitude: number | null; longitude: number | null; level: number; order: number; isActive: boolean; _count?: { listings: number }; parent?: { id: string; name: string } | null
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Location | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', parentId: '', latitude: '', longitude: '', level: 0, order: 0, isActive: true })

  useEffect(() => { fetchLocations() }, [])

  const fetchLocations = async () => {
    try {
      const res = await apiFetch('/api/admin/locations')
      if (res.ok) setLocations(await res.json())
    } catch {} finally { setLoading(false) }
  }

  const saveLocation = async () => {
    try {
      const body = { ...form, parentId: form.parentId || null, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null }
      const res = editing
        ? await apiFetch(`/api/admin/locations/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : await apiFetch('/api/admin/locations', { method: 'POST', body: JSON.stringify(body) })
      if (res.ok) { toast.success(editing ? 'Location updated' : 'Location created'); setDialogOpen(false); fetchLocations() }
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') }
  }

  const deleteLocation = async (id: string) => {
    if (!confirm('Delete this location?')) return
    try {
      const res = await apiFetch(`/api/admin/locations/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchLocations() }
    } catch { toast.error('Failed to delete') }
  }

  const openEdit = (loc: Location) => {
    setEditing(loc); setForm({ name: loc.name, slug: loc.slug, parentId: loc.parentId || '', latitude: loc.latitude?.toString() || '', longitude: loc.longitude?.toString() || '', level: loc.level, order: loc.order, isActive: loc.isActive }); setDialogOpen(true)
  }

  const openNew = () => {
    setEditing(null); setForm({ name: '', slug: '', parentId: '', latitude: '', longitude: '', level: 0, order: 0, isActive: true }); setDialogOpen(true)
  }

  const filtered = locations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
  const parentLocations = locations.filter((l) => l.level === 0)

  const levelLabels = ['Country', 'County', 'Sub-County', 'Area']

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">{locations.length} locations total</p>
        </div>
        <Button onClick={openNew} className="rounded-2xl bg-royal text-white border-0"><Plus className="h-4 w-4 mr-1" /> New Location</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 rounded-2xl h-11 bg-white border-slate-200" />
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Location</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Level</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Parent</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Listings</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array(8).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-4 w-36" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-4 w-10" /></TableCell><TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell><TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell></TableRow>
              )) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><MapPin className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p>No locations found</p></TableCell></TableRow>
              ) : filtered.map((loc) => (
                <TableRow key={loc.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-electric/10 flex items-center justify-center text-electric text-sm shrink-0"><MapPin className="h-4 w-4" /></div>
                      <div><p className="text-sm font-semibold text-navy">{loc.name}</p><p className="text-xs text-muted-foreground">/{loc.slug}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] rounded-lg">{levelLabels[loc.level] || `Level ${loc.level}`}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{loc.parent?.name || '-'}</TableCell>
                  <TableCell className="text-sm text-navy font-medium">{loc._count?.listings || 0}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${loc.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{loc.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(loc)} className="rounded-lg"><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteLocation(loc.id)} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle className="text-navy text-xl font-bold">{editing ? 'Edit Location' : 'New Location'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} placeholder="Nairobi" className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Level</Label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value={0}>Country</option><option value={1}>County</option><option value={2}>Sub-County</option><option value={3}>Area</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Parent</Label>
                <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="">None</option>
                  {parentLocations.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Latitude</Label>
                <Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-1.2921" className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Longitude</Label>
                <Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="36.8219" className="rounded-xl h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="rounded-xl h-10" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <Label className="text-xs font-medium text-navy">Active</Label>
              </div>
            </div>
            <Button onClick={saveLocation} className="w-full rounded-2xl bg-royal text-white border-0">{editing ? 'Update' : 'Create'} Location</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
