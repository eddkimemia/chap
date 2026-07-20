'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Download,
  DollarSign,
  TrendingUp,
  CreditCard,
  Filter,
  Calendar,
} from 'lucide-react'
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

import { apiFetch } from '@/lib/api-client'

interface Payment {
  id: string
  amount: number
  currency: string
  type: string
  status: string
  description: string
  createdAt: string
  user: { name: string; email?: string }
}

interface PaymentStats {
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  averageTransaction: number
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
  refunded: 'bg-slate-50 text-slate-600 border-slate-200',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [payRes, statsRes] = await Promise.allSettled([
        apiFetch(`/api/admin/payments?status=${statusFilter}`),
        apiFetch('/api/admin/payments/stats'),
      ])

      if (payRes.status === 'fulfilled' && payRes.value.ok) {
      const data = await payRes.value.json()
        setPayments(data.payments || [])
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json())
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Revenue', value: `KES ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'This Month', value: `KES ${(stats?.monthlyRevenue ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-royal' },
    { title: 'Transactions', value: (stats?.totalTransactions ?? 0).toLocaleString(), icon: CreditCard, color: 'bg-accent-orange' },
    { title: 'Avg. Transaction', value: `KES ${(stats?.averageTransaction ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-accent-purple' },
  ]

  const filtered = payments.filter((p) => {
    if (!search) return true
    return (
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6 lg:pl-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track revenue and manage transactions</p>
        </div>
        <Button variant="outline" className="rounded-xl gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="rounded-2xl border-0 shadow-premium">
                  <CardContent className="p-5"><Skeleton className="h-16" /></CardContent>
                </Card>
              ))
          : statCards.map((stat) => (
              <Card key={stat.title} className="rounded-2xl border-0 shadow-premium card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                      <p className="text-xl font-bold text-navy mt-1">{stat.value}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-2xl h-11 bg-white border-slate-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-2xl h-11 bg-white border-slate-200">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card className="rounded-2xl border-0 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Transaction</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">User</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Amount</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-navy font-semibold text-xs uppercase tracking-wider">Date</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/20">
                    <TableCell>
                      <p className="text-sm font-medium text-navy truncate max-w-[200px]">{payment.description}</p>
                      <p className="text-[10px] text-muted-foreground">{payment.id.slice(0, 8)}...</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-navy">{payment.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{payment.user?.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] rounded-lg">
                        {payment.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-navy">
                        {payment.currency} {payment.amount?.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] rounded-lg font-medium ${statusColors[payment.status] || ''}`}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
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
