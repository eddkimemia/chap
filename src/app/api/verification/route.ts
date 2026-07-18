import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const request_ = await db.verificationRequest.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      verification: request_ || null,
      isVerified: user.isVerified,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { idType, idNumber, idFrontUrl, idBackUrl, selfieUrl } = body

    if (!idType || !idNumber) {
      return NextResponse.json({ error: 'ID type and number are required' }, { status: 400 })
    }

    const existing = await db.verificationRequest.findFirst({
      where: { userId: user.id, status: 'pending' },
    })
    if (existing) {
      return NextResponse.json({ error: 'You already have a pending verification request' }, { status: 409 })
    }

    const request_ = await db.verificationRequest.create({
      data: {
        userId: user.id,
        idType,
        idNumber,
        idFrontUrl: idFrontUrl || '',
        idBackUrl: idBackUrl || '',
        selfieUrl: selfieUrl || '',
        status: 'pending',
      },
    })

    return NextResponse.json({ verification: request_ }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Verification submission error:', error)
    return NextResponse.json({ error: 'Failed to submit verification' }, { status: 500 })
  }
}
