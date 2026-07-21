import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      include: {
        user1: { select: { id: true, name: true, username: true, avatar: true } },
        user2: { select: { id: true, name: true, username: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.user1Id === user.id ? conv.user2 : conv.user1
        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.id,
            receiverId: user.id,
            isRead: false,
          },
        })

        let listingTitle: string | undefined
        let listingImage: string | undefined
        if (conv.listingId) {
          const listing = await db.listing.findUnique({
            where: { id: conv.listingId },
            select: {
              title: true,
              images: { take: 1, select: { url: true }, orderBy: { order: 'asc' } },
            },
          })
          if (listing) {
            listingTitle = listing.title
            listingImage = listing.images[0]?.url
          }
        }

        return {
          id: conv.id,
          participantName: otherUser.name,
          participantId: otherUser.id,
          participantUsername: otherUser.username,
          avatar: otherUser.avatar,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unread: unreadCount,
          listingTitle,
          listingImage,
        }
      })
    )

    return NextResponse.json({ conversations: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 })
  }
}
