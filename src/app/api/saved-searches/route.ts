import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const savedSearches = await db.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(savedSearches)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching saved searches:', error)
    return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { name, query } = body

    if (!name || !query) {
      return NextResponse.json({ error: 'name and query are required' }, { status: 400 })
    }

    const savedSearch = await db.savedSearch.create({
      data: {
        userId: user.id,
        name,
        query: typeof query === 'string' ? query : JSON.stringify(query),
      },
    })

    return NextResponse.json(savedSearch, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error saving search:', error)
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 })
  }
}
