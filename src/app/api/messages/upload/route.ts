import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversationId = formData.get('conversationId') as string | null

    if (!file || !conversationId) {
      return NextResponse.json({ error: 'File and conversationId are required' }, { status: 400 })
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

    const isImage = file.type.startsWith('image/')

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        receiverId,
        listingId: conversation.listingId,
        content: file.name,
        type: isImage ? 'image' : 'file',
        mediaUrl: dataUri,
      },
    })

    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: file.name, lastMessageAt: new Date() },
    })

    return NextResponse.json({ message })
  } catch (error) {
    if ((error as any).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
