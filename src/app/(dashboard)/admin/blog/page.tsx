'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Edit3, Trash2, ExternalLink, BookOpen, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'

import { apiFetch } from '@/lib/api-client'

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; coverImage: string; authorName: string; category: string; status: string; views: number; createdAt: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', coverImage: '', authorName: 'ChapKE Team', category: '', tags: '', status: 'draft', seoTitle: '', seoDesc: '' })

  useEffect(() => { fetchPosts() }, [statusFilter])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({ status: statusFilter, search })
      const res = await apiFetch(`/api/admin/blog?${params}`)
      if (res.ok) { const data = await res.json(); setPosts(data.posts || []) }
    } catch {} finally { setLoading(false) }
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchPosts() }

  const savePost = async () => {
    try {
      const res = editing
        ? await apiFetch(`/api/admin/blog/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
        : await apiFetch('/api/admin/blog', { method: 'POST', body: JSON.stringify(form) })
      if (res.ok) { toast.success(editing ? 'Post updated' : 'Post created'); setDialogOpen(false); fetchPosts() }
      else toast.error('Failed to save')
    } catch { toast.error('Failed to save') }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try {
      const res = await apiFetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchPosts() }
    } catch { toast.error('Failed to delete') }
  }

  const publishPost = async (post: BlogPost) => {
    try {
      const res = await apiFetch(`/api/admin/blog/${post.id}`, { method: 'PUT', body: JSON.stringify({ status: 'published', publishedAt: new Date().toISOString() }) })
      if (res.ok) { toast.success('Published'); fetchPosts() }
    } catch { toast.error('Failed') }
  }

  const openEdit = (p: BlogPost) => {
    setEditing(p); setForm({ title: p.title, slug: p.slug, content: '', excerpt: p.excerpt, coverImage: p.coverImage, authorName: p.authorName, category: p.category, tags: '', status: p.status, seoTitle: '', seoDesc: '' }); setDialogOpen(true)
  }

  const openNew = () => {
    setEditing(null); setForm({ title: '', slug: '', content: '', excerpt: '', coverImage: '', authorName: 'ChapKE Team', category: '', tags: '', status: 'draft', seoTitle: '', seoDesc: '' }); setDialogOpen(true)
  }

  const statusColors: Record<string, string> = { published: 'bg-emerald-50 text-emerald-700 border-emerald-200', draft: 'bg-slate-50 text-slate-600 border-slate-200', archived: 'bg-amber-50 text-amber-700 border-amber-200' }

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} posts</p>
        </div>
        <Button onClick={openNew} className="rounded-2xl bg-royal text-white border-0"><Plus className="h-4 w-4 mr-1" /> New Post</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 rounded-2xl h-11 bg-white border-slate-200" />
          </div>
          <Button type="submit" className="rounded-2xl bg-royal text-white border-0">Search</Button>
        </form>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-2xl h-11 bg-white border-slate-200"><Filter className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Post</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Author</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Views</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array(6).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-4 w-40" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell><TableCell><Skeleton className="h-4 w-10" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell></TableRow>
              )) : posts.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p>No posts found</p></TableCell></TableRow>
              ) : posts.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {p.coverImage ? <img src={p.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-slate-300 text-xs">{p.title.charAt(0)}</div>}
                      </div>
                      <div><p className="text-sm font-semibold text-navy truncate max-w-[220px]">{p.title}</p><p className="text-xs text-muted-foreground">/{p.slug}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] rounded-lg">{p.category || 'Uncategorized'}</Badge></TableCell>
                  <TableCell className="text-sm text-navy">{p.authorName}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${statusColors[p.status] || ''}`}>{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.views}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {p.status !== 'published' && <DropdownMenuItem onClick={() => publishPost(p)} className="rounded-lg"><BookOpen className="h-4 w-4 mr-2 text-emerald-500" /> Publish</DropdownMenuItem>}
                        <DropdownMenuItem asChild className="rounded-lg"><Link href={`/blog/${p.slug}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> View</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(p)} className="rounded-lg"><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deletePost(p.id)} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle className="text-navy text-xl font-bold">{editing ? 'Edit Post' : 'New Post'}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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
              <Label className="text-xs font-medium text-navy">Content (HTML/Markdown)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="rounded-xl font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-navy">Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="rounded-xl text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Cover Image URL</Label>
                <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Author Name</Label>
                <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-navy">Status</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <Button onClick={savePost} className="w-full rounded-2xl bg-royal text-white border-0">{editing ? 'Update' : 'Create'} Post</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
