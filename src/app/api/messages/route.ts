import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { receiverId, conversationId, listingId, content, type } = body

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      )
    }

    let conversation: {
      id: string; user1Id: string; user2Id: string; listingId: string | null
    } | null = null

    if (conversationId) {
      conversation = await db.conversation.findUnique({ where: { id: conversationId } })
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (receiverId) {
      if (receiverId === user.id) {
        return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
      }

      const receiver = await db.user.findUnique({ where: { id: receiverId } })
      if (!receiver) {
        return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
      }

      conversation = await db.conversation.findFirst({
        where: {
          OR: [
            { user1Id: user.id, user2Id: receiverId, listingId: listingId || null },
            { user1Id: receiverId, user2Id: user.id, listingId: listingId || null },
          ],
        },
      })

      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            user1Id: user.id,
            user2Id: receiverId,
            listingId: listingId || null,
          },
        })
      }
    } else {
      return NextResponse.json(
        { error: 'conversationId or receiverId is required' },
        { status: 400 }
      )
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Failed to resolve conversation' }, { status: 500 })
    }

    const receiverUserId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id

    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        receiverId: receiverUserId,
        listingId: listingId || null,
        content,
        type: type || 'text',
      },
    })

    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    })

    await db.notification.create({
      data: {
        userId: receiverUserId,
        type: 'message',
        title: 'New message',
        body: content.substring(0, 100),
        data: JSON.stringify({ conversationId: conversation.id, senderId: user.id }),
      },
    })

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        type: message.type,
        mediaUrl: message.mediaUrl,
        isRead: message.isRead,
      },
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
