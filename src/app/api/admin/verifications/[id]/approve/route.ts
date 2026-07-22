import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { status, reviewNote } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 })
    }

    const request_ = await db.verificationRequest.findUnique({ where: { id }, include: { user: { select: { name: true, email: true, premiumUntil: true } } } })
    if (!request_) return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })

    const updated = await db.verificationRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: admin.id,
        reviewNote: reviewNote || '',
        reviewedAt: new Date(),
      },
    })

    if (status === 'approved') {
      await db.user.update({
        where: { id: request_.userId },
        data: { isVerified: true },
      })

      if (!request_.user.email) {
        return NextResponse.json({ error: 'User has no email address' }, { status: 400 })
      }

      await sendEmail({
        to: request_.user.email,
        subject: 'Identity Verification Approved – ChapKE',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#1e293b;">Identity Verified ✅</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${request_.user.name}</strong>,</p>
            <p style="color:#475569;font-size:15px;line-height:1.6;">Your identity documents have been reviewed and <strong style="color:#059669;">approved</strong>.</p>
            <p style="color:#475569;font-size:15px;line-height:1.6;">You are now a verified seller on ChapKE and can start publishing ads.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chapke.co.ke'}/dashboard/listings/new"
               style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;margin-top:8px;">
              Post Your First Ad
            </a>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            <p style="color:#94a3b8;font-size:13px;">ChapKE Team</p>
          </div>
        `,
      })
    } else if (status === 'rejected') {
      if (!request_.user.email) {
        return NextResponse.json({ error: 'User has no email address' }, { status: 400 })
      }
      await sendEmail({
        to: request_.user.email,
        subject: 'Identity Verification Update – ChapKE',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#1e293b;">Verification Not Approved</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${request_.user.name}</strong>,</p>
            <p style="color:#475569;font-size:15px;line-height:1.6;">Unfortunately your identity documents could not be verified at this time.</p>
            ${reviewNote ? `<p style="color:#dc2626;font-size:14px;background:#fef2f2;padding:12px;border-radius:8px;"><strong>Reason:</strong> ${reviewNote}</p>` : ''}
            <p style="color:#475569;font-size:15px;line-height:1.6;">Please submit new documents from your settings page.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chapke.co.ke'}/dashboard/settings"
               style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;margin-top:8px;">
              Resubmit Documents
            </a>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            <p style="color:#94a3b8;font-size:13px;">ChapKE Team</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ verification: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Verification review error:', error)
    return NextResponse.json({ error: 'Failed to review verification' }, { status: 500 })
  }
}
