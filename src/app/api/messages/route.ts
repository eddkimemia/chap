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
        user1: { select: { id: true, name: true, avatar: true } },
        user2: { select: { id: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const { receiverId, listingId, content, type } = body

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'receiverId and content are required' },
        { status: 400 }
      )
    }

    if (receiverId === user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    const receiver = await db.user.findUnique({ where: { id: receiverId } })
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    let conversation = await db.conversation.findFirst({
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

    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        receiverId,
        listingId: listingId || null,
        content,
        type: type || 'text',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
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
        userId: receiverId,
        type: 'message',
        title: 'New message',
        body: content.substring(0, 100),
        data: JSON.stringify({ conversationId: conversation.id, senderId: user.id }),
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
