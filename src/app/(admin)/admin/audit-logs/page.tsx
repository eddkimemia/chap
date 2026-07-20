'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface AuditLog {
  id: string; action: string; entity: string; entityId: string | null; details: string; ipAddress: string | null; userAgent: string | null; createdAt: string; user: { id: string; name: string; email: string } | null
}

const actionColors: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  update: 'bg-royal/10 text-royal border-royal/20',
  delete: 'bg-red-50 text-red-600 border-red-200',
  suspend: 'bg-red-50 text-red-600 border-red-200',
  approve: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  login: 'bg-blue-50 text-blue-700 border-blue-200',
  logout: 'bg-slate-50 text-slate-600 border-slate-200',
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchLogs() }, [page, actionFilter, entityFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30', action: actionFilter, entity: entityFilter })
      const res = await apiFetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) { const data = await res.json(); setLogs(data.logs || []); setTotalPages(data.totalPages || 1) }
    } catch { toast.error('Failed to load audit logs') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 lg:pl-6">
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all administrative actions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-2xl h-11 bg-white border-slate-200"><Filter className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Actions" /></SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="suspend">Suspend</SelectItem>
            <SelectItem value="approve">Approve</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-2xl h-11 bg-white border-slate-200"><Filter className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All Entities" /></SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="">All Entities</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="listing">Listing</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="location">Location</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="plan">Plan</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="cms">CMS</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Action</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Admin</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Entity</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Details</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">IP</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? Array(10).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-4 w-40" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-20" /></TableCell></TableRow>
              )) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><Clock className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p>No audit logs found</p></TableCell></TableRow>
              ) : logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20">
                  <TableCell><Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${actionColors[log.action] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{log.action}</Badge></TableCell>
                  <TableCell className="text-sm text-navy">{log.user?.name || 'System'}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] rounded-lg">{log.entity}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{log.details}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{log.ipAddress || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl"><ChevronLeft className="h-4 w-4" /> Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl">Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
