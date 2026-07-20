'use client'

import { useState, useEffect } from 'react'
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
  role: string
  isActive: boolean
  isSuspended: boolean
  createdAt: string
  _count?: { listings: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
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
                      <Badge
                        variant="outline"
                        className={`text-[10px] rounded-lg font-medium ${
                          user.isSuspended
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
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
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onClick={() => toggleSuspend(user.id, !user.isSuspended)}
                            className="rounded-lg"
                          >
                            {user.isSuspended ? (
                              <><Shield className="h-4 w-4 mr-2" /> Activate</>
                            ) : (
                              <><ShieldOff className="h-4 w-4 mr-2" /> Suspend</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeRole(user.id, user.role === 'admin' ? 'user' : 'admin')} className="rounded-lg">
                            <Shield className="h-4 w-4 mr-2" /> Make {user.role === 'admin' ? 'User' : 'Admin'}
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
