import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, generateOTP, hashPassword, destroyAllUserSessions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tempPassword = generateOTP()
    const passwordHash = await hashPassword(tempPassword)

    await db.$transaction([
      db.user.update({ where: { id }, data: { passwordHash } }),
      db.moderationLog.create({
        data: {
          userId: admin.id,
          action: 'password_reset',
          reason: `Admin ${admin.name} reset password for ${user.name} (${user.email || user.phone})`,
          details: JSON.stringify({ targetUserId: id }),
        },
      }),
    ])

    await destroyAllUserSessions(id)

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Your password has been reset by admin',
        html: `<p>Hi ${user.name},</p>
<p>An administrator has reset your password on ChapKE.</p>
<p><strong>Your temporary password is: ${tempPassword}</strong></p>
<p>Please log in and change your password immediately.</p>
<p>If you did not request this, please contact support.</p>`,
      })
    }

    return NextResponse.json({
      message: 'Password reset successfully',
      ...(!user.email ? { tempPassword } : {}),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
