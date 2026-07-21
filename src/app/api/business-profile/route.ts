import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const profile = await db.businessProfile.findUnique({ where: { userId: user.id } })
    return NextResponse.json({ businessProfile: profile || {} })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch business profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { companyName, companyLogo, description, industry, taxId, registrationNo, website, employeeCount, foundedYear, address, socialLinks } = body

    const data: Record<string, unknown> = {}
    if (companyName !== undefined) data.companyName = companyName
    if (companyLogo !== undefined) data.companyLogo = companyLogo
    if (description !== undefined) data.description = description
    if (industry !== undefined) data.industry = industry
    if (taxId !== undefined) data.taxId = taxId
    if (registrationNo !== undefined) data.registrationNo = registrationNo
    if (website !== undefined) data.website = website
    if (employeeCount !== undefined) data.employeeCount = employeeCount
    if (foundedYear !== undefined) data.foundedYear = foundedYear ? parseInt(String(foundedYear), 10) || null : null
    if (address !== undefined) data.address = address
    if (socialLinks !== undefined) data.socialLinks = socialLinks

    const profile = await db.businessProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, companyName: companyName || '', ...data } as any,
      update: data,
    })

    return NextResponse.json({ businessProfile: profile })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Update business profile error:', error)
    return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 })
  }
}
