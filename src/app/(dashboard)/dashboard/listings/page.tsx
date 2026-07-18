'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, Search, MoreVertical, Pencil, Trash2, Eye, Star, Zap, Clock,
  ExternalLink, Grid3X3, List, Filter, Copy, Play, Pause, RefreshCw,
  TrendingUp, CheckSquare, Square, Megaphone, DollarSign, Ban, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { formatPrice, timeAgo } from '@/lib/format'

import { apiFetch } from '@/lib/api-client'

interface ListingItem {
  id: string; title: string; price: number; currency: string; status: string
  views: number; images: { url: string }[]; createdAt: string; isFeatured: boolean
  boosts: { id: string; type: string; endDate: string; status: string }[]
  boostUntil?: string; featuredUntil?: string
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
  sold: 'bg-blue-50 text-blue-700 border-blue-200',
  expired: 'bg-red-50 text-red-600 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  suspended: 'bg-red-50 text-red-600 border-red-200',
}

const statusOptions = ['all', 'active', 'draft', 'pending', 'sold', 'expired', 'suspended']

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [boostDialog, setBoostDialog] = useState<{ open: boolean; listingId: string }>({ open: false, listingId: '' })
  const fetchListings = useCallback(async () => {
    try {
      const params = new URLSearchParams({ mine: 'true' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await apiFetch(`/api/listings?${params}`)
      if (res.ok) { const data = await res.json(); setListings(data.listings || []) }
    } catch { toast.error('Failed to load listings') } finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchListings() }, [fetchListings])

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) || l.status.includes(search.toLowerCase())
  )

  const handleAction = async (id: string, action: string) => {
    try {
      let res: Response
      switch (action) {
        case 'delete':
          res = await apiFetch(`/api/listings/${id}`, { method: 'DELETE' })
          if (res.ok) { setListings((p) => p.filter((l) => l.id !== id)); toast.success('Listing deleted') }
          else { const d = await res.json(); throw new Error(d.error) }
          break
        case 'duplicate':
          res = await apiFetch(`/api/listings/${id}/duplicate`, { method: 'POST' })
          if (res.ok) { toast.success('Listing duplicated as draft'); fetchListings() }
          else { const d = await res.json(); throw new Error(d.error) }
          break
        case 'pause':
          res = await apiFetch(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'suspended' }) })
          if (res.ok) { toast.success('Listing paused'); fetchListings() }
          else { const d = await res.json(); throw new Error(d.error) }
          break
        case 'activate':
          res = await apiFetch(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'active' }) })
          if (res.ok) { toast.success('Listing activated'); fetchListings() }
          else { const d = await res.json(); throw new Error(d.error) }
          break
        case 'renew':
          res = await apiFetch(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'active', publishedAt: new Date().toISOString() }) })
          if (res.ok) { toast.success('Listing renewed'); fetchListings() }
          else { const d = await res.json(); throw new Error(d.error) }
          break
        case 'feature':
          setBoostDialog({ open: true, listingId: id })
          return
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (err: any) { toast.error(err.message) }
  }

  const handleBoost = async (type: string, durationDays: number) => {
    try {
      const res = await apiFetch(`/api/listings/${boostDialog.listingId}/boost`, {
        method: 'POST', body: JSON.stringify({ type, durationDays, amount: type === 'featured' ? 0 : 0 }),
      })
      if (res.ok) { toast.success(`Listing ${type === 'featured' ? 'featured' : 'boosted'} successfully!`); setBoostDialog({ open: false, listingId: '' }); fetchListings() }
      else { const d = await res.json(); throw new Error(d.error) }
    } catch (err: any) { toast.error(err.message) }
  }

  const handleBulk = async (action: string) => {
    if (selected.size === 0) { toast.error('Select listings first'); return }
    try {
      const res = await apiFetch('/api/listings/bulk', {
        method: 'POST', body: JSON.stringify({ ids: Array.from(selected), action }),
      })
      if (res.ok) { toast.success(`Bulk ${action} completed`); setSelected(new Set()); fetchListings() }
      else { const d = await res.json(); throw new Error(d.error) }
    } catch (err: any) { toast.error(err.message) }
  }

  const toggleSelect = (id: string) => {
    setSelected((p) => { const next = new Set(p); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((l) => l.id)))
  }

  const promoOptions = [
    { type: 'featured', label: 'Feature Listing', desc: 'Featured badge + top placement', days: 7 },
    { type: 'boost', label: 'Boost Listing', desc: 'Higher visibility in search', days: 7 },
    { type: 'promote', label: 'Promote Listing', desc: 'Premium promotion package', days: 14 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Listings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage all your marketplace listings</p>
        </div>
        <Button className="rounded-xl bg-royal border-0 shadow-lg shadow-royal/20" asChild>
          <Link href="/dashboard/listings/new"><Plus className="h-4 w-4 mr-1.5" /> Create Listing</Link>
        </Button>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-royal/5 border border-royal/20">
          <CheckSquare className="h-4 w-4 text-royal" />
          <span className="text-sm font-semibold text-navy">{selected.size} selected</span>
          <div className="ml-auto flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => handleBulk('activate')} className="rounded-xl text-xs h-8">
              <Play className="h-3 w-3 mr-1" /> Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk('pause')} className="rounded-xl text-xs h-8">
              <Pause className="h-3 w-3 mr-1" /> Pause
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk('feature')} className="rounded-xl text-xs h-8">
              <Star className="h-3 w-3 mr-1" /> Feature
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk('delete')} className="rounded-xl text-xs h-8 text-red-600 hover:text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="rounded-xl text-xs h-8">Cancel</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-[140px] rounded-xl bg-white border-slate-200 text-sm">
            <Filter className="h-3.5 w-3.5 mr-1" /><SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s === 'all' ? 'All Status' : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-royal text-white' : 'text-slate-400 hover:text-navy'}`}><List className="h-4 w-4" /></button>
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-royal text-white' : 'text-slate-400 hover:text-navy'}`}><Grid3X3 className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="p-4 space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-premium">
          <Package className="h-16 w-16 mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-navy mb-2">No listings found</h3>
          <p className="text-sm text-slate-400 mb-4">Get started by creating your first listing.</p>
          <Button className="rounded-xl bg-royal border-0" asChild>
            <Link href="/dashboard/listings/new"><Plus className="h-4 w-4 mr-1.5" /> Create Listing</Link>
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                </TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((listing) => (
                <TableRow key={listing.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <input type="checkbox" checked={selected.has(listing.id)} onChange={() => toggleSelect(listing.id)} className="rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {listing.images?.length ? (
                          <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy truncate max-w-[200px]">{listing.title}</p>
                        {listing.isFeatured && <Badge className="text-[9px] mt-0.5 bg-amber-50 text-amber-700 border-amber-200 font-medium">Featured</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm font-bold text-navy">{formatPrice(listing.price)}</span></TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] rounded-lg font-medium border ${statusColors[listing.status] || statusColors.draft}`}>{listing.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{listing.views || 0}</TableCell>
                  <TableCell className="text-sm text-slate-500">{timeAgo(listing.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuItem asChild className="rounded-lg"><Link href={`/dashboard/listings/${listing.id}/edit`}><Pencil className="h-4 w-4 mr-2" /> Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(listing.id, 'duplicate')} className="rounded-lg"><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {listing.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleAction(listing.id, 'pause')} className="rounded-lg"><Pause className="h-4 w-4 mr-2" /> Pause</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction(listing.id, 'activate')} className="rounded-lg"><Play className="h-4 w-4 mr-2" /> {listing.status === 'draft' ? 'Publish' : 'Activate'}</DropdownMenuItem>
                        )}
                        {listing.status === 'expired' && (
                          <DropdownMenuItem onClick={() => handleAction(listing.id, 'renew')} className="rounded-lg"><RefreshCw className="h-4 w-4 mr-2" /> Renew</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleAction(listing.id, 'feature')} className="rounded-lg"><Star className="h-4 w-4 mr-2" /> Promote / Feature</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-lg"><Link href={`/listing/${(listing as any).slug || listing.id}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> View Live</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(listing.id, 'delete')} className="rounded-lg text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <Card key={listing.id} className="rounded-2xl border-0 shadow-premium card-hover overflow-hidden">
              <div className="h-40 bg-slate-100 relative">
                {listing.images?.length ? (
                  <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center"><Package className="h-10 w-10 text-slate-200" /></div>
                )}
                <Badge className={`absolute top-2 right-2 text-[9px] rounded-lg font-medium border ${statusColors[listing.status] || statusColors.draft}`}>{listing.status}</Badge>
                {listing.isFeatured && <Badge className="absolute top-2 left-2 text-[9px] bg-royal text-white border-none rounded-lg">Featured</Badge>}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-navy truncate">{listing.title}</h3>
                <p className="text-sm font-bold text-royal mt-1">{formatPrice(listing.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Eye className="h-3 w-3" />{listing.views}</span>
                  <span className="text-xs text-slate-400">{timeAgo(listing.createdAt)}</span>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg flex-1" asChild>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}><Pencil className="h-3 w-3 mr-1" /> Edit</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg" onClick={() => handleAction(listing.id, 'duplicate')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 w-8 rounded-lg p-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl w-44">
                      {listing.status === 'active' ? (
                        <DropdownMenuItem onClick={() => handleAction(listing.id, 'pause')} className="rounded-lg"><Pause className="h-4 w-4 mr-2" /> Pause</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleAction(listing.id, 'activate')} className="rounded-lg"><Play className="h-4 w-4 mr-2" /> Activate</DropdownMenuItem>
                      )}
                      {listing.status === 'expired' && <DropdownMenuItem onClick={() => handleAction(listing.id, 'renew')} className="rounded-lg"><RefreshCw className="h-4 w-4 mr-2" /> Renew</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => handleAction(listing.id, 'feature')} className="rounded-lg"><Star className="h-4 w-4 mr-2" /> Promote</DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg"><Link href={`/listing/${(listing as any).slug || listing.id}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> View Live</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(listing.id, 'delete')} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Boost/Promote Dialog */}
      <Dialog open={boostDialog.open} onOpenChange={(o) => setBoostDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-accent-orange" /> Promote Listing</DialogTitle>
            <DialogDescription>Boost your listing&apos;s visibility and reach more buyers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {promoOptions.map((opt) => (
              <button key={opt.type} onClick={() => handleBoost(opt.type, opt.days)}
                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-royal/30 hover:bg-royal/5 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy group-hover:text-royal transition-colors">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-royal">{opt.days} days</p>
                    <p className="text-[10px] text-slate-400">Free trial</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBoostDialog({ open: false, listingId: '' })} className="rounded-xl">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
