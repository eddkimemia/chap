import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const listing = await db.listing.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const updated = await db.listing.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    })

    if (status !== listing.status) {
      await db.moderationLog.create({
        data: {
          userId: admin.id,
          listingId: id,
          action: status === 'active' ? 'approved' : status === 'suspended' ? 'suspended' : 'manual_review',
          reason: `Status changed from ${listing.status} to ${status}`,
          details: JSON.stringify({ previousStatus: listing.status, newStatus: status }),
        },
      })

      if (status === 'active' || status === 'suspended') {
        await db.notification.create({
          data: {
            userId: listing.userId,
            type: 'system',
            title: status === 'active' ? 'Listing Approved' : 'Listing Suspended',
            body: status === 'active'
              ? `Your listing "${listing.title}" has been approved and is now live.`
              : `Your listing "${listing.title}" has been suspended.`,
            data: JSON.stringify({ listingId: id, slug: listing.slug }),
          },
        })

        await sendEmail({
          to: listing.user.email,
          subject: status === 'active'
            ? 'Your Listing Has Been Approved – ChapKE'
            : 'Your Listing Has Been Suspended – ChapKE',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
              <h2 style="color:#1e293b;">${status === 'active' ? 'Listing Approved ✅' : 'Listing Suspended'}</h2>
              <p style="color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${listing.user.name}</strong>,</p>
              <p style="color:#475569;font-size:15px;line-height:1.6;">
                ${status === 'active'
                  ? `Your listing <strong>"${listing.title}"</strong> has been reviewed and is now <strong style="color:#059669;">live</strong> on ChapKE.`
                  : `Your listing <strong>"${listing.title}"</strong> has been suspended. Please review our guidelines and contact support if you have questions.`
                }
              </p>
              ${status === 'active' ? `
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chapke.co.ke'}/listing/${listing.slug}"
                   style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;margin-top:8px;">
                  View Your Listing
                </a>
              ` : ''}
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="color:#94a3b8;font-size:13px;">ChapKE Team</p>
            </div>
          `,
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
