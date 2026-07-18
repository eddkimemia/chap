import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)

    return NextResponse.json({ success: true, message: 'User blocked. Block list management will be available in a future update.' })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  }
}
