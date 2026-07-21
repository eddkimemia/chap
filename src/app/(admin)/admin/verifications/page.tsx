'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  ShieldCheck,
  XCircle,
  Eye,
  ImageIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface VerificationUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  isVerified: boolean
}

interface VerificationRecord {
  id: string
  userId: string
  user: VerificationUser
  idType: string
  idNumber: string
  idFrontUrl: string
  idBackUrl: string
  selfieUrl: string
  status: string
  reviewedBy: string | null
  reviewNote: string
  reviewedAt: string | null
  createdAt: string
}

export default function AdminVerificationsPage() {
  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('pending')

  const [previewUrl, setPreviewUrl] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<VerificationRecord | null>(null)
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved')
  const [reviewNote, setReviewNote] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const statusFilter = statusTab === 'all' ? '' : statusTab

  const filtered = records.filter((r) => {
    if (search) {
      const q = search.toLowerCase()
      const userName = r.user.name?.toLowerCase() || ''
      const email = r.user.email?.toLowerCase() || ''
      const idNumber = r.idNumber?.toLowerCase() || ''
      if (!userName.includes(q) && !email.includes(q) && !idNumber.includes(q)) return false
    }
    return true
  })

  useEffect(() => { fetchVerifications() }, [statusTab])

  const fetchVerifications = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(`/api/admin/verifications?status=${statusFilter || 'all'}`)
      if (res.ok) {
        const data = await res.json()
        setRecords(data.verifications || [])
      }
    } catch {} finally { setLoading(false) }
  }

  const openReview = (record: VerificationRecord, action: 'approved' | 'rejected') => {
    setReviewTarget(record)
    setReviewAction(action)
    setReviewNote('')
    setReviewOpen(true)
  }

  const submitReview = async () => {
    if (!reviewTarget) return
    setReviewSubmitting(true)
    try {
      const res = await apiFetch(`/api/admin/verifications/${reviewTarget.id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status: reviewAction, reviewNote }),
      })
      if (res.ok) {
        toast.success(`Verification ${reviewAction}`)
        setReviewOpen(false)
        fetchVerifications()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to review')
      }
    } catch { toast.error('Failed to review') }
    finally { setReviewSubmitting(false) }
  }

  const idTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      national_id: 'National ID',
      passport: 'Passport',
      drivers_license: "Driver's License",
      alien_id: 'Alien ID',
    }
    return labels[type] || type
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="text-[11px] rounded-lg bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-[11px] rounded-lg bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-[11px] rounded-lg bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Verification Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Review identity documents submitted by users</p>
        </div>
      </div>

      <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList className="rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg text-xs">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg text-xs">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg text-xs">Rejected</TabsTrigger>
          </TabsList>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl text-sm"
            />
          </div>
        </div>
      </Tabs>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">User</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">ID Type</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">ID Number</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Documents</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Submitted</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(7).fill(0).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No verification requests found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Users can submit KYC documents from their settings page</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-blue-600 text-white font-semibold text-sm shrink-0">
                          {record.user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">{record.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{record.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-navy">{idTypeLabel(record.idType)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-navy">{record.idNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {record.idFrontUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setPreviewUrl(record.idFrontUrl); setPreviewOpen(true) }} title="ID Front">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                        {record.idBackUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setPreviewUrl(record.idBackUrl); setPreviewOpen(true) }} title="ID Back">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                        {record.selfieUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setPreviewUrl(record.selfieUrl); setPreviewOpen(true) }} title="Selfie">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.status === 'pending' ? (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            className="rounded-lg h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => openReview(record, 'approved')}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg h-8 text-xs text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => openReview(record, 'rejected')}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          {record.reviewNote && (
                            <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={record.reviewNote}>
                              Note: {record.reviewNote}
                            </p>
                          )}
                          <span className="text-[10px] text-muted-foreground/60">
                            {record.reviewedAt ? new Date(record.reviewedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Image preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex items-center justify-center bg-muted/30 rounded-xl p-4 max-h-[70vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Document" className="max-w-full max-h-[65vh] rounded-lg object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approved' ? (
                <><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Approve Verification</>
              ) : (
                <><XCircle className="h-5 w-5 text-red-500" /> Reject Verification</>
              )}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approved'
                ? 'This user will be marked as verified and will receive an email notification.'
                : 'The user will be notified with your review note.'}
            </DialogDescription>
          </DialogHeader>
          {reviewTarget && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-blue-600 text-white font-semibold">
                  {reviewTarget.user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{reviewTarget.user.name}</p>
                  <p className="text-xs text-muted-foreground">{reviewTarget.user.email} · {idTypeLabel(reviewTarget.idType)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewNote" className="text-xs font-medium">Review Note (optional)</Label>
                <Textarea
                  id="reviewNote"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={reviewAction === 'rejected' ? 'Explain why the documents were rejected...' : 'Add an internal note...'}
                  className="rounded-xl text-sm min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={submitReview}
              disabled={reviewSubmitting}
              className={`rounded-xl ${reviewAction === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
            >
              {reviewSubmitting ? 'Submitting...' : reviewAction === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
