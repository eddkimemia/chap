'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Ban,
  XCircle,
  Eye,
  Filter,
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

interface Report {
  id: string
  reason: string
  description: string
  status: string
  createdAt: string
  reporter: { name: string; email?: string }
  listing?: { id: string; title: string }
  reportedUser?: { id: string; name: string; email?: string }
  type: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  dismissed: 'bg-slate-50 text-slate-600 border-slate-200',
  warned: 'bg-red-50 text-red-700 border-red-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')

  useEffect(() => {
    fetchReports()
  }, [statusFilter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(`/api/admin/reports?status=${statusFilter}`)
      if (res.ok) {
      const data = await res.json()
        setReports(data.reports || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/api/admin/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
        toast.success(`Report ${status}`)
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const suspendListing = async (listingId: string) => {
    try {
      await apiFetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' }),
      })
      toast.success('Listing suspended')
    } catch {
      toast.error('Failed')
    }
  }

  const banUser = async (userId: string) => {
    if (!confirm('Suspend this user?')) return
    try {
      await apiFetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
      })
      toast.success('User suspended')
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <div className="space-y-6 lg:pl-6">
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and handle reported content and users</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] rounded-2xl h-11 bg-white border-slate-200">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="warned">Warned</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Report</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Reporter</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Target</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                    </TableRow>
                  ))
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p>No reports found</p>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-navy">{report.reason}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{report.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-navy">{report.reporter?.name}</p>
                      <p className="text-xs text-muted-foreground">{report.reporter?.email}</p>
                    </TableCell>
                    <TableCell>
                      {report.listing && (
                        <div>
                          <p className="text-xs text-royal font-medium">Listing</p>
                          <p className="text-sm text-navy truncate max-w-[180px]">{report.listing.title}</p>
                        </div>
                      )}
                      {report.reportedUser && (
                        <div>
                          <p className="text-xs text-red-500 font-medium">User</p>
                          <p className="text-sm text-navy">{report.reportedUser.name}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${statusColors[report.status] || ''}`}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => updateStatus(report.id, 'dismissed')} className="rounded-lg">
                            <CheckCircle className="h-4 w-4 mr-2 text-slate-500" /> Dismiss
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(report.id, 'warned')} className="rounded-lg">
                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" /> Warn
                          </DropdownMenuItem>
                          {report.listing && (
                            <DropdownMenuItem onClick={() => suspendListing(report.listing!.id)} className="rounded-lg">
                              <XCircle className="h-4 w-4 mr-2 text-red-500" /> Suspend Listing
                            </DropdownMenuItem>
                          )}
                          {report.reportedUser && (
                            <DropdownMenuItem onClick={() => banUser(report.reportedUser!.id)} className="rounded-lg text-red-600 focus:text-red-600">
                              <Ban className="h-4 w-4 mr-2" /> Ban User
                            </DropdownMenuItem>
                          )}
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
