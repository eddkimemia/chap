import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { conversationId } = await params

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    await db.message.updateMany({
      where: {
        conversationId,
        receiverId: user.id,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    })

    return NextResponse.json(messages)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { conversationId } = await params
    const body = await request.json()

    const { content, type, listingId } = body

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const receiverId =
      conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        receiverId,
        listingId: listingId || conversation.listingId || null,
        content,
        type: type || 'text',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    await db.conversation.update({
      where: { id: conversationId },
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
        data: JSON.stringify({ conversationId, senderId: user.id }),
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { conversationId } = await params

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.message.deleteMany({ where: { conversationId } })
    await db.conversation.delete({ where: { id: conversationId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}
