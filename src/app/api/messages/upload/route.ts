import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

const MAX_IMAGE_SIZE = 1024 * 1024 // 1MB
const MAX_VOICE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversationId = formData.get('conversationId') as string | null
    const uploadType = formData.get('type') as string | null // 'voice' or undefined

    if (!file || !conversationId) {
      return NextResponse.json({ error: 'File and conversationId are required' }, { status: 400 })
    }

    if (uploadType === 'voice') {
      if (!file.type.startsWith('audio/')) {
        return NextResponse.json({ error: 'Invalid audio file type' }, { status: 400 })
      }
      if (file.size > MAX_VOICE_SIZE) {
        return NextResponse.json({ error: 'Voice message must be under 5MB' }, { status: 400 })
      }
    } else {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: 'Image must be under 1MB' }, { status: 400 })
      }
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const receiverId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const messageType = uploadType === 'voice' ? 'voice' : 'image'

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        receiverId,
        listingId: conversation.listingId,
        content: '',
        type: messageType,
        mediaUrl: dataUri,
      },
    })

    const lastMessageText = uploadType === 'voice' ? '🎤 Voice message' : '📷 Photo'

    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: lastMessageText, lastMessageAt: new Date() },
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
    })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
