import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.isVerified = status === 'approved' ? true : false
    }

    const profiles = await db.businessProfile.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        industry: true,
        taxId: true,
        registrationNo: true,
        isVerified: true,
        verifiedAt: true,
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true, username: true },
        },
      },
      orderBy: { verifiedAt: { sort: 'desc', nulls: 'last' } },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 })
  }
}
