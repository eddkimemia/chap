import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username')
    if (!username || username.length < 3) {
      return NextResponse.json({ available: false })
    }
    const cleaned = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const existing = await db.user.findUnique({ where: { username: cleaned } })
    return NextResponse.json({ available: !existing })
  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json({ available: false })
  }
}
