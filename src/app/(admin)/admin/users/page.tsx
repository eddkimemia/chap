'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  MoreVertical,
  Shield,
  ShieldOff,
  Trash2,
  Ban,
  ChevronLeft,
  ChevronRight,
  Users,
  KeyRound,
  Eye,
  EyeOff,
  ClipboardList,
  FileText,
  Activity,
  Bell,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface UserRecord {
  id: string
  name: string
  email?: string
  phone?: string
  username?: string
  role: string
  isActive: boolean
  isSuspended: boolean
  isBanned: boolean
  bannedReason?: string
  isVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  notes: string
  createdAt: string
  lastLoginAt?: string
  _count?: { listings: number; sessions: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [activeUser, setActiveUser] = useState<UserRecord | null>(null)
  const [dialog, setDialog] = useState<'reset' | 'verify' | 'notify' | 'impersonate' | 'activity' | 'ban' | 'notes' | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)

  const [verifyState, setVerifyState] = useState({ isVerified: false, isEmailVerified: false, isPhoneVerified: false })
  const [verifySubmitting, setVerifySubmitting] = useState(false)

  const [notifyTitle, setNotifyTitle] = useState('')
  const [notifyBody, setNotifyBody] = useState('')
  const [notifySubmitting, setNotifySubmitting] = useState(false)

  const [impersonating, setImpersonating] = useState(false)
  const [impersonateToken, setImpersonateToken] = useState('')

  const [activityData, setActivityData] = useState<{
    moderationLogs: any[]; listings: any[]; sessions: any[]
  } | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)

  const [banReason, setBanReason] = useState('')
  const [banSubmitting, setBanSubmitting] = useState(false)

  const [notesText, setNotesText] = useState('')
  const [notesSubmitting, setNotesSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(`/api/admin/users?page=${page}&limit=20&search=${search}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const toggleSuspend = async (userId: string, suspend: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/${suspend ? 'suspend' : 'activate'}`, {
        method: 'PUT',
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isSuspended: suspend, isActive: !suspend } : u
          )
        )
        toast.success(suspend ? 'User suspended' : 'User activated')
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const changeRole = async (userId: string, role: string) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
        toast.success(`Role changed to ${role}`)
      }
    } catch {
      toast.error('Failed to change role')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) return
    try {
      const res = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        toast.success('User deleted')
      }
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const handleResetPassword = async () => {
    if (!activeUser) return
    setResetting(true)
    try {
      const res = await apiFetch(`/api/admin/users/${activeUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Temporary password sent to ${activeUser.email || activeUser.phone || 'user'}`)
        if (data.tempPassword) {
          setNewPassword(data.tempPassword)
          setShowPassword(true)
        } else {
          setDialog(null)
          setActiveUser(null)
        }
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch {
      toast.error('Failed to reset password')
    } finally {
      setResetting(false)
    }
  }

  const handleVerify = async () => {
    if (!activeUser) return
    setVerifySubmitting(true)
    try {
      const res = await apiFetch(`/api/admin/users/${activeUser.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyState),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === activeUser.id ? { ...u, ...verifyState } : u))
        toast.success('Verification updated')
        setDialog(null)
        setActiveUser(null)
      }
    } catch {
      toast.error('Failed to update verification')
    } finally {
      setVerifySubmitting(false)
    }
  }

  const handleNotify = async () => {
    if (!activeUser || !notifyTitle || !notifyBody) return
    setNotifySubmitting(true)
    try {
      const res = await apiFetch(`/api/admin/users/${activeUser.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notifyTitle, body: notifyBody }),
      })
      if (res.ok) {
        toast.success(`Notification sent to ${activeUser.name}`)
        setDialog(null)
        setActiveUser(null)
        setNotifyTitle('')
        setNotifyBody('')
      }
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setNotifySubmitting(false)
    }
  }

  const handleImpersonate = async () => {
    if (!activeUser) return
    setImpersonating(true)
    try {
      const res = await apiFetch(`/api/admin/users/${activeUser.id}/impersonate`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setImpersonateToken(data.token)
        toast.success(`Logged in as ${activeUser.name}`)
      } else {
        toast.error(data.error || 'Failed to impersonate')
      }
    } catch {
      toast.error('Failed to impersonate')
    } finally {
      setImpersonating(false)
    }
  }

  const handleActivity = async () => {
    if (!activeUser) return
    setActivityLoading(true)
    try {
      const res = await apiFetch(`/api/admin/users/${activeUser.id}/activity`)
      if (res.ok) {
        setActivityData(await res.json())
      }
    } catch {
      toast.error('Failed to load activity')
    } finally {
      setActivityLoading(false)
    }
  }

  const handleBan = async () => {
    if (!activeUser) return
    setBanSubmitting(true)
    try {
      const isBanned = !activeUser.isBanned
      const res = await apiFetch(`/api/admin/users/${activeUser.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned, reason: isBanned ? banReason : '' }),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === activeUser.id ? { ...u, isBanned, bannedReason: isBanned ? banReason : '' } : u))
        toast.success(isBanned ? 'User banned' : 'User unbanned')
        setDialog(null)
        setActiveUser(null)
        setBanReason('')
      }
    } catch {
      toast.error('Failed to update ban status')
    } finally {
      setBanSubmitting(false)
    }
  }

  const handleNotes = async () => {
    if (!activeUser) return
    setNotesSubmitting(true)
    try {
      const res = await apiFetch(`/api/admin/users/${activeUser.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesText }),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === activeUser.id ? { ...u, notes: notesText } : u))
        toast.success('Notes updated')
        setDialog(null)
        setActiveUser(null)
      }
    } catch {
      toast.error('Failed to update notes')
    } finally {
      setNotesSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Manage Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} users loaded</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-2xl h-11 bg-white border-slate-200"
          />
        </div>
        <Button type="submit" className="rounded-2xl bg-royal text-white border-0">
          Search
        </Button>
      </form>

      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">User</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Username</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Joined</TableHead>
                <TableHead className="text-right text-navy font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                    </TableRow>
                  ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-royal flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email || user.phone || 'No contact'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-navy font-mono text-xs">{user.username || '—'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] rounded-lg font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] rounded-lg font-medium ${
                            user.isBanned
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : user.isSuspended
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : user.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {user.isBanned ? 'Banned' : user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.isVerified && (
                          <Badge variant="outline" className="text-[10px] rounded-lg font-medium bg-blue-50 text-blue-700 border-blue-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-56">
                          <DropdownMenuItem onClick={() => toggleSuspend(user.id, !user.isSuspended)} className="rounded-lg">
                            {user.isSuspended ? (
                              <><Shield className="h-4 w-4 mr-2" /> Activate</>
                            ) : (
                              <><ShieldOff className="h-4 w-4 mr-2" /> Suspend</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActiveUser(user); setDialog('verify'); setVerifyState({ isVerified: user.isVerified, isEmailVerified: user.isEmailVerified, isPhoneVerified: user.isPhoneVerified }) }} className="rounded-lg">
                            <Shield className="h-4 w-4 mr-2" /> Verify User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActiveUser(user); setDialog('reset'); setNewPassword(''); setShowPassword(false) }} className="rounded-lg">
                            <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeRole(user.id, user.role === 'admin' ? 'user' : 'admin')} className="rounded-lg">
                            <Shield className="h-4 w-4 mr-2" /> Make {user.role === 'admin' ? 'User' : 'Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href={`/admin/listings?userName=${user.name}`}>
                              <Eye className="h-4 w-4 mr-2" /> View Listings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg">
                            <Link href={`/seller/${user.username || user.id}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" /> View Seller Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActiveUser(user); setDialog('notify'); setNotifyTitle(''); setNotifyBody('') }} className="rounded-lg">
                            <Ban className="h-4 w-4 mr-2" /> Send Notification
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActiveUser(user); setDialog('impersonate'); setImpersonateToken('') }} className="rounded-lg">
                            <Users className="h-4 w-4 mr-2" /> Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActiveUser(user); setDialog('activity'); setActivityData(null); handleActivity() }} className="rounded-lg">
                            <ClipboardList className="h-4 w-4 mr-2" /> View Activity
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActiveUser(user); setDialog('ban'); setBanReason(user.bannedReason || '') }} className="rounded-lg">
                            <Ban className="h-4 w-4 mr-2" /> {user.isBanned ? 'Unban' : 'Ban'} User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActiveUser(user); setDialog('notes'); setNotesText(user.notes || '') }} className="rounded-lg">
                            <FileText className="h-4 w-4 mr-2" /> Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteUser(user.id)} className="rounded-lg text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete User
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

      {/* Reset Password Dialog */}
      <Dialog open={dialog === 'reset'} onOpenChange={(o) => { if (!o) { setDialog(null); setActiveUser(null); setNewPassword(''); setShowPassword(false) } }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-royal" /> Reset Password
            </DialogTitle>
            <DialogDescription>
              Send a temporary password to <strong>{activeUser?.name}</strong> ({activeUser?.email || activeUser?.phone || 'No email'})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {activeUser?.email ? (
              <p className="text-sm text-muted-foreground">
                A temporary password will be sent to <strong>{activeUser.email}</strong>. The user will be logged out of all devices.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  This user has no email address. The temporary password will be shown below.
                </p>
                <Label htmlFor="new-password">Temporary Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    readOnly
                    className="h-11 rounded-xl border-slate-200 pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDialog(null); setActiveUser(null); setNewPassword(''); setShowPassword(false) }} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetting || (newPassword !== '' && !showPassword)}
              className="rounded-xl bg-royal hover:bg-royal/90 border-0"
            >
              {resetting ? 'Sending...' : newPassword ? 'Done' : 'Send Temporary Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify User Dialog */}
      <Dialog open={dialog === 'verify'} onOpenChange={(o) => { if (!o) { setDialog(null); setActiveUser(null) } }}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-royal" /> Verify User
            </DialogTitle>
            <DialogDescription>
              Update verification status for <strong>{activeUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={verifyState.isVerified}
                onChange={(e) => setVerifyState((s) => ({ ...s, isVerified: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-royal"
              />
              <div>
                <p className="text-sm font-semibold text-navy">Verified User</p>
                <p className="text-xs text-muted-foreground">Shows verified badge on profile</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={verifyState.isEmailVerified}
                onChange={(e) => setVerifyState((s) => ({ ...s, isEmailVerified: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-royal"
              />
              <div>
                <p className="text-sm font-semibold text-navy">Email Verified</p>
                <p className="text-xs text-muted-foreground">Email address has been confirmed</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={verifyState.isPhoneVerified}
                onChange={(e) => setVerifyState((s) => ({ ...s, isPhoneVerified: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-royal"
              />
              <div>
                <p className="text-sm font-semibold text-navy">Phone Verified</p>
                <p className="text-xs text-muted-foreground">Phone number has been confirmed</p>
              </div>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialog(null); setActiveUser(null) }} className="rounded-xl">Cancel</Button>
            <Button onClick={handleVerify} disabled={verifySubmitting} className="rounded-xl bg-royal hover:bg-royal/90 border-0">
              {verifySubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={dialog === 'notify'} onOpenChange={(o) => { if (!o) { setDialog(null); setActiveUser(null); setNotifyTitle(''); setNotifyBody('') } }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-royal" /> Send Notification
            </DialogTitle>
            <DialogDescription>
              Send a system notification to <strong>{activeUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                placeholder="Notification title..."
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                value={notifyBody}
                onChange={(e) => setNotifyBody(e.target.value)}
                placeholder="Write your message..."
                className="w-full min-h-[100px] rounded-xl border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialog(null); setActiveUser(null); setNotifyTitle(''); setNotifyBody('') }} className="rounded-xl">Cancel</Button>
            <Button onClick={handleNotify} disabled={notifySubmitting || !notifyTitle || !notifyBody} className="rounded-xl bg-royal hover:bg-royal/90 border-0">
              {notifySubmitting ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate Dialog */}
      <Dialog open={dialog === 'impersonate'} onOpenChange={(o) => { if (!o) { setDialog(null); setActiveUser(null); setImpersonateToken('') } }}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-royal" /> Impersonate User
            </DialogTitle>
            <DialogDescription>
              Log in as <strong>{activeUser?.name}</strong> ({activeUser?.email || activeUser?.phone})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {impersonateToken ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  You are now logged in as {activeUser?.name}. Bookmark this page or copy the link below.
                </div>
                <div className="space-y-2">
                  <Label>Impersonation Token</Label>
                  <Input value={impersonateToken} readOnly className="h-11 rounded-xl border-slate-200 font-mono text-xs" />
                </div>
                <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 border-0" asChild>
                  <Link href="/">Go to Site as {activeUser?.name?.split(' ')[0]}</Link>
                </Button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                You are about to log in as <strong>{activeUser?.name}</strong>. This action is logged for security purposes.
              </div>
            )}
          </div>
          <DialogFooter>
            {impersonateToken ? (
              <Button variant="outline" onClick={() => { setDialog(null); setActiveUser(null); setImpersonateToken('') }} className="rounded-xl">
                Close
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setDialog(null); setActiveUser(null) }} className="rounded-xl">Cancel</Button>
                <Button onClick={handleImpersonate} disabled={impersonating} className="rounded-xl bg-royal hover:bg-royal/90 border-0">
                  {impersonating ? 'Logging in...' : 'Impersonate'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Activity Dialog */}
      <Dialog open={dialog === 'activity'} onOpenChange={(o) => { if (!o) { setDialog(null); setActiveUser(null); setActivityData(null) } }}>
        <DialogContent className="rounded-2xl sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-royal" /> Activity Log — {activeUser?.name}
            </DialogTitle>
          </DialogHeader>
          {activityLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-royal/30 border-t-royal rounded-full animate-spin" />
            </div>
          ) : activityData ? (
            <div className="space-y-6">
              {activityData.listings.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-navy mb-2">Listings ({activityData.listings.length})</h4>
                  <div className="space-y-2">
                    {activityData.listings.map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-navy truncate">{l.title}</p>
                          <p className="text-[10px] text-muted-foreground">{l.status} · KES {l.price?.toLocaleString()} · {l.views} views</p>
                        </div>
                        <Link href={`/listing/${l.slug || l.id}`} target="_blank" className="shrink-0 ml-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-royal" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activityData.moderationLogs.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-navy mb-2">Moderation History ({activityData.moderationLogs.length})</h4>
                  <div className="space-y-2">
                    {activityData.moderationLogs.map((log: any) => (
                      <div key={log.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-navy capitalize">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{log.reason}</p>
                        {log.listing && <p className="text-[11px] text-royal mt-0.5">Listing: {log.listing.title}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activityData.sessions.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-navy mb-2">Sessions ({activityData.sessions.length})</h4>
                  <div className="space-y-2">
                    {activityData.sessions.map((s: any) => (
                      <div key={s.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${s.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {s.isActive ? 'Active' : 'Expired'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.ipAddress || 'Unknown IP'} · {s.userAgent?.slice(0, 60) || 'Unknown device'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!activityData.listings.length && !activityData.moderationLogs.length && !activityData.sessions.length && (
                <p className="text-sm text-muted-foreground text-center py-8">No activity found for this user.</p>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Ban/Unban Dialog */}
      <Dialog open={dialog === 'ban'} onOpenChange={(o) => { if (!o) { setDialog(null); setActiveUser(null); setBanReason('') } }}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" /> {activeUser?.isBanned ? 'Unban' : 'Ban'} User
            </DialogTitle>
            <DialogDescription>
              {activeUser?.isBanned
                ? `Reactivate access for ${activeUser?.name}`
                : `Restrict access for ${activeUser?.name}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!activeUser?.isBanned && (
              <div className="space-y-2">
                <Label>Reason for ban</Label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full min-h-[80px] rounded-xl border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
                  rows={3}
                />
              </div>
            )}
            {activeUser?.isBanned && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                This will unban {activeUser?.name} and restore their access.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialog(null); setActiveUser(null); setBanReason('') }} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleBan}
              disabled={banSubmitting}
              className={`rounded-xl border-0 ${activeUser?.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {banSubmitting ? 'Processing...' : activeUser?.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={dialog === 'notes'} onOpenChange={(o) => { if (!o) { setDialog(null); setActiveUser(null) } }}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-royal" /> Admin Notes — {activeUser?.name}
            </DialogTitle>
            <DialogDescription>
              Internal notes visible only to admins
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Add internal notes about this user..."
              className="w-full min-h-[150px] rounded-xl border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialog(null); setActiveUser(null) }} className="rounded-xl">Cancel</Button>
            <Button onClick={handleNotes} disabled={notesSubmitting} className="rounded-xl bg-royal hover:bg-royal/90 border-0">
              {notesSubmitting ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
