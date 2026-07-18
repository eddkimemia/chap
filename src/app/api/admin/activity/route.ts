import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const [recentUsers, recentListings, recentPayments, recentReports] = await Promise.all([
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      db.listing.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
      }),
      db.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
      }),
      db.report.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          reason: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
        },
      }),
    ])

    const activity = [
      ...recentUsers.map((u) => ({ type: 'user', ...u })),
      ...recentListings.map((l) => ({ type: 'listing', ...l })),
      ...recentPayments.map((p) => ({ type: 'payment', ...p })),
      ...recentReports.map((r) => ({ type: 'report', ...r })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(activity)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
