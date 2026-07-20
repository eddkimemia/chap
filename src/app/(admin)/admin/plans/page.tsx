'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Edit3, Trash2, CreditCard } from 'lucide-react'
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

interface Plan {
  id: string; name: string; slug: string; description: string; price: number; currency: string; interval: string; maxListings: number; maxImages: number; maxVideos: number; isFeatured: boolean; isPromoted: boolean; isActive: boolean; order: number; _count?: { subscriptions: number }
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: 0, currency: 'KES', interval: 'monthly', maxListings: 5, maxImages: 5, maxVideos: 0, isFeatured: false, isPromoted: false, isActive: true, order: 0 })

  useEffect(() => { fetchPlans() }, [])

  const fetchPlans = async () => {
    try {
      const res = await apiFetch('/api/admin/plans')
      if (res.ok) setPlans(await res.json())
    } catch {} finally { setLoading(false) }
  }

  const savePlan = async () => {
    try {
      const res = editing
        ? await apiFetch(`/api/admin/plans/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
        : await apiFetch('/api/admin/plans', { method: 'POST', body: JSON.stringify(form) })
      if (res.ok) { toast.success(editing ? 'Plan updated' : 'Plan created'); setDialogOpen(false); fetchPlans() }
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') }
  }

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return
    try {
      const res = await apiFetch(`/api/admin/plans/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchPlans() }
    } catch { toast.error('Failed to delete') }
  }

  const openEdit = (plan: Plan) => {
    setEditing(plan); setForm(plan); setDialogOpen(true)
  }

  const openNew = () => {
    setEditing(null); setForm({ name: '', slug: '', description: '', price: 0, currency: 'KES', interval: 'monthly', maxListings: 5, maxImages: 5, maxVideos: 0, isFeatured: false, isPromoted: false, isActive: true, order: 0 }); setDialogOpen(true)
  }

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">{plans.length} plans configured</p>
        </div>
        <Button onClick={openNew} className="rounded-2xl bg-royal text-white border-0"><Plus className="h-4 w-4 mr-1" /> New Plan</Button>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Plan</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Price</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Interval</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Limits</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Subscribers</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array(4).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-4 w-32" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-10" /></TableCell><TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell></TableRow>
              )) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><CreditCard className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p>No plans found</p></TableCell></TableRow>
              ) : plans.map((plan) => (
                <TableRow key={plan.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple text-sm shrink-0"><CreditCard className="h-4 w-4" /></div>
                      <div><p className="text-sm font-semibold text-navy">{plan.name}</p><p className="text-xs text-muted-foreground truncate max-w-[180px]">{plan.description}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm font-bold text-navy">{plan.currency} {plan.price.toLocaleString()}</span></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] rounded-lg">{plan.interval}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{plan.maxListings} listings · {plan.maxImages} images{plan.isFeatured && ' · Featured'}</TableCell>
                  <TableCell className="text-sm text-navy font-medium">{plan._count?.subscriptions || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(plan)} className="rounded-lg"><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deletePlan(plan.id)} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle className="text-navy text-xl font-bold">{editing ? 'Edit Plan' : 'New Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Price</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Currency</Label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="KES">KES</option><option value="USD">USD</option><option value="EUR">EUR</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Interval</Label>
                <select value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Max Listings</Label>
                <Input type="number" value={form.maxListings} onChange={(e) => setForm({ ...form, maxListings: parseInt(e.target.value) || 0 })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Max Images</Label>
                <Input type="number" value={form.maxImages} onChange={(e) => setForm({ ...form, maxImages: parseInt(e.target.value) || 0 })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Max Videos</Label>
                <Input type="number" value={form.maxVideos} onChange={(e) => setForm({ ...form, maxVideos: parseInt(e.target.value) || 0 })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} /><Label className="text-xs font-medium">Featured</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isPromoted} onCheckedChange={(v) => setForm({ ...form, isPromoted: v })} /><Label className="text-xs font-medium">Promoted</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><Label className="text-xs font-medium">Active</Label></div>
            </div>
            <Button onClick={savePlan} className="w-full rounded-2xl bg-royal text-white border-0">{editing ? 'Update' : 'Create'} Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
