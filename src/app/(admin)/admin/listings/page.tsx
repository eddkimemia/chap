'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  Eye,
  ExternalLink,
  Filter,
  Calendar,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface AdminListing {
  id: string
  slug?: string
  title: string
  price: number
  currency: string
  status: string
  views: number
  createdAt: string
  user: { name: string; email?: string }
  category: { name: string }
  isFeatured: boolean
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  suspended: 'bg-red-50 text-red-600 border-red-200',
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
  expired: 'bg-red-50 text-red-600 border-red-200',
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [userName, setUserName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchListings()
  }, [statusFilter, search, userName, startDate, endDate])

  useEffect(() => {
    apiFetch('/api/admin/listings?status=pending&limit=1')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPendingCount(d.pagination?.total || 0) })
      .catch(() => {})
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      if (userName) params.set('userName', userName)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      const res = await apiFetch(`/api/admin/listings?${params}`)
      if (res.ok) {
      const data = await res.json()
        setListings(data.listings || [])
      }
      apiFetch('/api/admin/listings?status=pending&limit=1')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setPendingCount(d.pagination?.total || 0) })
        .catch(() => {})
    } catch {} finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchListings()
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/api/admin/listings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
        toast.success(`Listing ${status}`)
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const toggleFeature = async (id: string, featured: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/listings/${id}/feature`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: featured }),
      })
      if (res.ok) {
        setListings((prev) => prev.map((l) => (l.id === id ? { ...l, isFeatured: featured } : l)))
        toast.success(featured ? 'Featured' : 'Unfeatured')
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return
    try {
      const res = await apiFetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id))
        toast.success('Listing deleted')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Manage Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage all listings on the platform</p>
        </div>
        {pendingCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm font-semibold text-amber-700">{pendingCount} pending {pendingCount === 1 ? 'listing' : 'listings'}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 rounded-2xl h-11 bg-white border-slate-200"
              />
            </div>
            <Button type="submit" className="rounded-2xl bg-royal text-white border-0">
              Search
            </Button>
          </form>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-2xl h-11 bg-white border-slate-200">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by seller name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="pl-11 rounded-2xl h-11 bg-white border-slate-200"
            />
            {userName && (
              <button onClick={() => setUserName('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-11 rounded-2xl h-11 bg-white border-slate-200 w-full sm:w-[180px]"
              placeholder="From"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-11 rounded-2xl h-11 bg-white border-slate-200 w-full sm:w-[180px]"
              placeholder="To"
            />
          </div>
          {(userName || startDate || endDate) && (
            <Button
              variant="outline"
              onClick={() => { setUserName(''); setStartDate(''); setEndDate('') }}
              className="rounded-2xl h-11"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Listing</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Seller</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Views</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                    </TableRow>
                  ))
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No listings found
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-navy truncate max-w-[220px]">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {listing.currency} {listing.price?.toLocaleString()} • {listing.category?.name}
                        </p>
                        {listing.isFeatured && (
                          <Badge className="text-[9px] mt-1 bg-amber-50 text-amber-700 border-amber-200">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-navy">{listing.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{listing.user?.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${statusColors[listing.status] || ''}`}>
                          {listing.status}
                        </Badge>
                        {listing.status === 'pending' && (
                          <Button
                            size="sm"
                            className="rounded-lg h-7 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white px-2"
                            onClick={() => updateStatus(listing.id, 'active')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{listing.views || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          {listing.status !== 'active' && (
                            <DropdownMenuItem onClick={() => updateStatus(listing.id, 'active')} className="rounded-lg">
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" /> Approve
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'suspended' && (
                            <DropdownMenuItem onClick={() => updateStatus(listing.id, 'suspended')} className="rounded-lg">
                              <XCircle className="h-4 w-4 mr-2 text-red-500" /> Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toggleFeature(listing.id, !listing.isFeatured)} className="rounded-lg">
                            <Star className="h-4 w-4 mr-2 text-amber-500" /> {listing.isFeatured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href={`/listing/${listing.slug || listing.id}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" /> View Live
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteListing(listing.id)} className="rounded-lg text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
