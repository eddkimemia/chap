import { NextRequest, NextResponse } from 'next/server'
import {
  destroySession,
  getSessionTokenFromRequest,
  clearSessionCookie,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getSessionTokenFromRequest(request)

    if (token) {
      await destroySession(token)
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })
    clearSessionCookie(response)
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
