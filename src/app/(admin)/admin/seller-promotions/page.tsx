'use client'

import { useState, useEffect, useCallback } from 'react'
import { Award, Search, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'

interface SellerPromotion {
  id: string
  userId: string
  type: string
  listingId: string | null
  amount: number
  duration: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; premiumUntil: string | null }
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-50 text-slate-600 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

export default function SellerPromotionsPage() {
  const [promotions, setPromotions] = useState<SellerPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchPromotions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      params.set('limit', '100')
      const res = await apiFetch(`/api/admin/seller-promotions?${params}`)
      const data = await res.json()
      if (res.ok) {
        setPromotions(data.promotions)
        setTotal(data.total)
      } else {
        toast.error(data.error || 'Failed to load')
      }
    } catch {
      toast.error('Failed to load seller promotions')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchPromotions() }, [fetchPromotions])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this promotion? The user will lose premium status.')) return
    try {
      const res = await apiFetch('/api/admin/seller-promotions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'cancelled' }),
      })
      if (res.ok) {
        toast.success('Promotion cancelled')
        fetchPromotions()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to cancel')
      }
    } catch {
      toast.error('Failed to cancel promotion')
    }
  }

  const filtered = search
    ? promotions.filter((p) =>
        p.user.name.toLowerCase().includes(search.toLowerCase()) ||
        p.user.email.toLowerCase().includes(search.toLowerCase())
      )
    : promotions

  const activeCount = promotions.filter((p) => p.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Seller Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage premium seller promotions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-navy">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-navy">
              KES {promotions.reduce((s, p) => s + (p.status === 'active' ? p.amount : 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">All Promotions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-48 text-sm rounded-xl"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-9 w-36 text-sm rounded-xl">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={fetchPromotions}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    <Award className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No seller promotions found</p>
                    <p className="text-sm mt-1">Users can purchase seller promotions from the dashboard</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-navy">{p.user.name}</p>
                        <p className="text-xs text-slate-400">{p.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {p.type === 'shop' ? 'Shop' : 'Listing'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{p.duration}</TableCell>
                    <TableCell className="text-sm font-medium">KES {p.amount}</TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(p.startDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(p.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${statusColors[p.status] || ''}`}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          onClick={() => handleCancel(p.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
