'use client'

import { useState, useEffect } from 'react'
import { Search, Store, Shield, CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'
import Link from 'next/link'

interface BusinessProfile {
  id: string
  companyName: string
  industry: string
  taxId: string
  registrationNo: string
  isVerified: boolean
  verifiedAt: string | null
  user: {
    id: string
    name: string
    email: string | null
    phone: string | null
    avatar: string | null
    isVerified: boolean
    username: string | null
  }
}

export default function AdminBusinessVerificationsPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('pending')
  const [reviewDialog, setReviewDialog] = useState<BusinessProfile | null>(null)

  useEffect(() => { fetchProfiles() }, [tab])

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const status = tab === 'all' ? '' : tab
      const res = await apiFetch(`/api/admin/business-verifications${status ? `?status=${status}` : ''}`)
      if (res.ok) setProfiles(await res.json())
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!reviewDialog) return
    try {
      const res = await apiFetch(`/api/admin/business-verifications/${reviewDialog.id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        toast.success(`Business ${action === 'approve' ? 'approved' : 'rejected'}`)
        setReviewDialog(null)
        fetchProfiles()
      } else toast.error('Failed to update')
    } catch { toast.error('Failed to update') }
  }

  const filtered = profiles.filter((p) =>
    p.companyName.toLowerCase().includes(search.toLowerCase()) ||
    p.user.name.toLowerCase().includes(search.toLowerCase()) ||
    p.user.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Business Verifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and verify business profiles
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="pending" className="rounded-xl">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="rounded-xl">Approved</TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
        </TabsList>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business or owner name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 rounded-2xl h-11 bg-white border-slate-200"
            />
          </div>
        </div>

        <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Business</TableHead>
                  <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Owner</TableHead>
                  <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Industry</TableHead>
                  <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                )) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Store className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                      <p>No business {tab === 'pending' ? 'pending review' : 'profiles found'}</p>
                    </TableCell>
                  </TableRow>
                ) : filtered.map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-royal/10 flex items-center justify-center text-royal shrink-0">
                          <Store className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">{profile.companyName}</p>
                          {profile.taxId && (
                            <p className="text-[10px] text-muted-foreground">KRA PIN: {profile.taxId}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-navy">{profile.user.name}</p>
                        <p className="text-xs text-muted-foreground">{profile.user.email || profile.user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{profile.industry || '-'}</span>
                    </TableCell>
                    <TableCell>
                      {profile.isVerified ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] rounded-lg font-medium">
                          <CheckCircle className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] rounded-lg font-medium">
                          <Shield className="h-3 w-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {profile.user.username && (
                          <Link href={`/shop/${profile.user.username}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" title="View Shop">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl text-xs"
                          onClick={() => setReviewDialog(profile)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </Tabs>

      <Dialog open={!!reviewDialog} onOpenChange={(v) => !v && setReviewDialog(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy text-xl font-bold">Review Business</DialogTitle>
            <DialogDescription>Review business details before approving or rejecting.</DialogDescription>
          </DialogHeader>
          {reviewDialog && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-royal/10 flex items-center justify-center text-royal">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-navy">{reviewDialog.companyName}</p>
                    <p className="text-xs text-muted-foreground">{reviewDialog.industry || 'No industry specified'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Owner</p>
                    <p className="font-medium text-navy">{reviewDialog.user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-navy">{reviewDialog.user.email || '-'}</p>
                  </div>
                  {reviewDialog.taxId && (
                    <div>
                      <p className="text-xs text-muted-foreground">KRA PIN</p>
                      <p className="font-medium text-navy">{reviewDialog.taxId}</p>
                    </div>
                  )}
                  {reviewDialog.registrationNo && (
                    <div>
                      <p className="text-xs text-muted-foreground">Registration No.</p>
                      <p className="font-medium text-navy">{reviewDialog.registrationNo}</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2">
                {!reviewDialog.isVerified && (
                  <Button
                    variant="outline"
                    className="rounded-xl flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleReview('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                )}
                <Button
                  className="rounded-xl flex-1 bg-emerald-500 text-white hover:bg-emerald-600 border-0"
                  onClick={() => handleReview('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> {reviewDialog.isVerified ? 'Revoke' : 'Approve'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
