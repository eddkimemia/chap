'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Edit3, Trash2, FileText, Eye, EyeOff } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface CmsPage {
  id: string; title: string; slug: string; content: string; metaTitle: string; metaDesc: string; isPublished: boolean; createdAt: string; updatedAt: string
}

export default function AdminCmsPage() {
  const [pages, setPages] = useState<CmsPage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<CmsPage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', content: '', metaTitle: '', metaDesc: '', isPublished: true })

  useEffect(() => { fetchPages() }, [])

  const fetchPages = async () => {
    try {
      const res = await apiFetch('/api/admin/cms')
      if (res.ok) setPages(await res.json())
    } catch (error) { console.error('Failed to fetch CMS pages:', error) } finally { setLoading(false) }
  }

  const savePage = async () => {
    try {
      const res = editing
        ? await apiFetch(`/api/admin/cms/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
        : await apiFetch('/api/admin/cms', { method: 'POST', body: JSON.stringify(form) })
      if (res.ok) { toast.success(editing ? 'Page updated' : 'Page created'); setDialogOpen(false); fetchPages() }
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') }
  }

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page permanently?')) return
    try {
      const res = await apiFetch(`/api/admin/cms/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchPages() }
    } catch { toast.error('Failed to delete') }
  }

  const togglePublish = async (page: CmsPage) => {
    try {
      const res = await apiFetch(`/api/admin/cms/${page.id}`, { method: 'PUT', body: JSON.stringify({ isPublished: !page.isPublished }) })
      if (res.ok) { toast.success(page.isPublished ? 'Unpublished' : 'Published'); fetchPages() }
    } catch { toast.error('Failed') }
  }

  const openEdit = (p: CmsPage) => {
    setEditing(p); setForm({ title: p.title, slug: p.slug, content: p.content, metaTitle: p.metaTitle, metaDesc: p.metaDesc, isPublished: p.isPublished }); setDialogOpen(true)
  }

  const openNew = () => {
    setEditing(null); setForm({ title: '', slug: '', content: '', metaTitle: '', metaDesc: '', isPublished: true }); setDialogOpen(true)
  }

  const filtered = pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">CMS Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} pages</p>
        </div>
        <Button onClick={openNew} className="rounded-2xl bg-royal text-white border-0"><Plus className="h-4 w-4 mr-1" /> New Page</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 rounded-2xl h-11 bg-white border-slate-200" />
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Page</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Slug</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Updated</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-4 w-36" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell></TableRow>
              )) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p>No pages found</p></TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/20">
                  <TableCell><p className="text-sm font-semibold text-navy">{p.title}</p></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] rounded-lg">/{p.slug}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${p.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => togglePublish(p)} className="rounded-lg">{p.isPublished ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}{p.isPublished ? 'Unpublish' : 'Publish'}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(p)} className="rounded-lg"><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deletePage(p.id)} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
        <DialogContent className="rounded-3xl max-w-xl">
          <DialogHeader><DialogTitle className="text-navy text-xl font-bold">{editing ? 'Edit Page' : 'New Page'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Content (HTML)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="rounded-xl font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Meta Title</Label>
              <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Meta Description</Label>
              <Input value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <Label className="text-xs font-medium text-navy">Published</Label>
            </div>
            <Button onClick={savePage} className="w-full rounded-2xl bg-royal text-white border-0">{editing ? 'Update' : 'Create'} Page</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
