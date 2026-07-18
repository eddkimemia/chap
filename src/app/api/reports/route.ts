import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const reportSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  type: z.enum(['spam', 'scam', 'inappropriate', 'fake', 'duplicate', 'other']),
  reason: z.string().min(10, 'Please provide more details (at least 10 characters)').max(2000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = reportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { listingId, type, reason } = parsed.data
    const user = await getCurrentUser(request)

    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    await db.report.create({
      data: {
        authorId: user?.id ?? 'anonymous',
        listingId,
        targetId: listing.userId,
        type,
        reason,
        details: user ? '' : 'Reported anonymously',
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
