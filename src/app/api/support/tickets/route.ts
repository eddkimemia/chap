import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createTicketSchema = z.object({
  subject: z.string().min(3),
  category: z.string().min(1),
  message: z.string().min(10),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const tickets = await db.report.findMany({
      where: { authorId: user.id, type: { startsWith: 'support_' } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reason: true,
        type: true,
        status: true,
        createdAt: true,
        resolution: true,
      },
    })

    const mapped = tickets.map((t) => ({
      id: t.id,
      subject: t.reason,
      category: t.type.replace('support_', ''),
      status: t.status === 'pending' ? 'open' : t.status === 'reviewed' ? 'waiting' : 'resolved',
      priority: 'medium',
      createdAt: t.createdAt.toISOString().split('T')[0],
      lastUpdate: t.createdAt.toISOString().split('T')[0],
    }))

    return NextResponse.json({ tickets: mapped })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const parsed = createTicketSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const ticket = await db.report.create({
      data: {
        authorId: user.id,
        type: `support_${parsed.data.category}`,
        reason: parsed.data.subject,
        details: parsed.data.message,
        status: 'pending',
      },
    })

    return NextResponse.json({ ticket: { id: ticket.id, status: 'open' } }, { status: 201 })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
