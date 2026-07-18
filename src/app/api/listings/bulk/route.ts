import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { ids, action } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Listing IDs are required' }, { status: 400 })
    }
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const listings = await db.listing.findMany({ where: { id: { in: ids }, userId: user.id } })
    if (listings.length !== ids.length) {
      return NextResponse.json({ error: 'Some listings not found or not owned by you' }, { status: 400 })
    }

    let result: { count: number } = { count: 0 }

    switch (action) {
      case 'delete':
        result = await db.listing.deleteMany({ where: { id: { in: ids }, userId: user.id } })
        break
      case 'activate':
        result = await db.listing.updateMany({ where: { id: { in: ids }, userId: user.id }, data: { status: 'active' } })
        break
      case 'pause':
        result = await db.listing.updateMany({ where: { id: { in: ids }, userId: user.id }, data: { status: 'suspended' } })
        break
      case 'feature':
        for (const id of ids) {
      await db.listing.update({ where: { id }, data: { isFeatured: true } })
      await db.boost.create({ data: { listingId: id, userId: user.id, type: 'featured', amount: 0, startDate: new Date(), endDate: new Date(Date.now() + 7 * 86400000), status: 'active' } })
        }
        result = { count: ids.length }
        break
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, affected: result.count })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Bulk action error:', error)
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 })
  }
}
