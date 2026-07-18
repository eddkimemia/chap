import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const SUBSCRIBERS_PATH = 'data/newsletter-subscribers.json'

async function getSubscribers(): Promise<string[]> {
  try {
    const fs = await import('fs/promises')
    const raw = await fs.readFile(SUBSCRIBERS_PATH, 'utf-8')
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

async function saveSubscribers(emails: string[]): Promise<void> {
  const fs = await import('fs/promises')
  const dir = await import('path')
  await fs.mkdir(dir.dirname(SUBSCRIBERS_PATH), { recursive: true })
  await fs.writeFile(SUBSCRIBERS_PATH, JSON.stringify(emails, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rl = rateLimit(`newsletter:${ip}`, 5, 60)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const subscribers = await getSubscribers()
    if (subscribers.includes(email)) {
      return NextResponse.json({ message: 'Already subscribed' })
    }

    subscribers.push(email)
    await saveSubscribers(subscribers)

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  }
}
