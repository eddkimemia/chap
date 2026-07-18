'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Edit3, Trash2, FolderTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface Category {
  id: string; name: string; slug: string; icon: string; image: string; parentId: string | null; order: number; isActive: boolean; seoTitle: string; seoDesc: string; _count?: { listings: number }; parent?: { id: string; name: string } | null
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', icon: '', parentId: '', order: 0, isActive: true, seoTitle: '', seoDesc: '' })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/api/admin/categories')
      if (res.ok) setCategories(await res.json())
    } catch {} finally { setLoading(false) }
  }

  const saveCategory = async () => {
    try {
      const body = { ...form, parentId: form.parentId || null }
      const res = editing
        ? await apiFetch(`/api/admin/categories/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : await apiFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify(body) })
      if (res.ok) { toast.success(editing ? 'Category updated' : 'Category created'); setDialogOpen(false); fetchCategories() }
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    try {
      const res = await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchCategories() }
    } catch { toast.error('Failed to delete') }
  }

  const openEdit = (cat: Category) => {
    setEditing(cat); setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, parentId: cat.parentId || '', order: cat.order, isActive: cat.isActive, seoTitle: cat.seoTitle || '', seoDesc: cat.seoDesc || '' }); setDialogOpen(true)
  }

  const openNew = () => {
    setEditing(null); setForm({ name: '', slug: '', icon: '', parentId: '', order: 0, isActive: true, seoTitle: '', seoDesc: '' }); setDialogOpen(true)
  }

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  const parentCategories = categories.filter((c) => !c.parentId)

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories total</p>
        </div>
        <Button onClick={openNew} className="rounded-2xl bg-royal text-white border-0"><Plus className="h-4 w-4 mr-1" /> New Category</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 rounded-2xl h-11 bg-white border-slate-200" />
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Parent</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Listings</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Order</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array(8).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-4 w-36" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-4 w-10" /></TableCell><TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell><TableCell><Skeleton className="h-4 w-8" /></TableCell><TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell></TableRow>
              )) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><FolderTree className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p>No categories found</p></TableCell></TableRow>
              ) : filtered.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-royal/10 flex items-center justify-center text-royal text-sm shrink-0">{cat.icon || cat.name.charAt(0)}</div>
                      <div><p className="text-sm font-semibold text-navy">{cat.name}</p><p className="text-xs text-muted-foreground">/{cat.slug}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.parent?.name || '-'}</TableCell>
                  <TableCell className="text-sm text-navy font-medium">{cat._count?.listings || 0}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${cat.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{cat.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.order}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(cat)} className="rounded-lg"><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteCategory(cat.id)} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle className="text-navy text-xl font-bold">{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} placeholder="Category name" className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" className="rounded-xl h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Icon (emoji)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🔧" className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Parent Category</Label>
                <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="">None (Top Level)</option>
                  {parentCategories.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
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
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">SEO Title</Label>
              <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">SEO Description</Label>
              <Input value={form.seoDesc} onChange={(e) => setForm({ ...form, seoDesc: e.target.value })} className="rounded-xl h-10" />
            </div>
            <Button onClick={saveCategory} className="w-full rounded-2xl bg-royal text-white border-0">{editing ? 'Update' : 'Create'} Category</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
