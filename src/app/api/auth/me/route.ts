import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateOTP } from '@/lib/auth'

function maskDestination(value: string): string {
  if (value.includes('@')) {
    const [user, domain] = value.split('@')
    return user.length > 2
      ? `${user.slice(0, 2)}***@${domain}`
      : `${user.slice(0, 1)}***@${domain}`
  }
  return value.length > 4
    ? `${'*'.repeat(value.length - 4)}${value.slice(-4)}`
    : '****'
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true, businessProfile: true, notificationsPrefs: true },
    })

    return NextResponse.json({ user: fullUser })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const fullUser = await db.user.findUnique({ where: { id: user.id } })
    if (!fullUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { name, bio, avatar, city, country, address, website, phone, email, username } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar
    if (username !== undefined) {
      const cleaned = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
      if (cleaned.length < 3) {
        return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
      }
      const existing = await db.user.findUnique({ where: { username: cleaned } })
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
      updateData.username = cleaned
    }

    let pendingVerification: string | null = null
    let maskedDestination: string | null = null

    if (email !== undefined && email !== fullUser.email) {
      const existing = await db.user.findUnique({ where: { email } })
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
      updateData.pendingEmail = email || null
      updateData.isEmailVerified = false

      if (email) {
        const code = generateOTP()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 10)
        await db.twoFactorSession.create({
          data: { userId: user.id, code, type: 'verify_email', expiresAt },
        })
        pendingVerification = 'email'
        maskedDestination = maskDestination(email)
      }
    }

    if (phone !== undefined && phone !== fullUser.phone) {
      const existing = await db.user.findUnique({ where: { phone } })
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 })
      }
      updateData.pendingPhone = phone || null
      updateData.isPhoneVerified = false

      if (phone) {
        const code = generateOTP()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 10)
        await db.twoFactorSession.create({
          data: { userId: user.id, code, type: 'verify_phone', expiresAt },
        })
        pendingVerification = 'phone'
        maskedDestination = maskDestination(phone)
      }
    }

    await db.user.update({ where: { id: user.id }, data: updateData })

    if (city !== undefined || country !== undefined || address !== undefined || website !== undefined) {
      const profileData: Record<string, unknown> = {}
      if (city !== undefined) profileData.city = city
      if (country !== undefined) profileData.country = country
      if (address !== undefined) profileData.address = address
      if (website !== undefined) profileData.website = website

      await db.userProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...profileData } as any,
        update: profileData,
      })
    }

    const updated = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true, businessProfile: true, notificationsPrefs: true },
    })

    return NextResponse.json({
      user: updated,
      ...(pendingVerification && { pendingVerification, maskedDestination }),
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    await db.user.delete({ where: { id: user.id } })

    return NextResponse.json({ message: 'Account deleted' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
