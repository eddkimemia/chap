import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const settings = await db.systemSetting.findMany()
    const settingsMap: Record<string, unknown> = {}
    for (const s of settings) {
      if (s.type === 'boolean') settingsMap[s.key] = s.value === 'true'
      else if (s.type === 'number') settingsMap[s.key] = Number(s.value)
      else if (s.type === 'json') {
        try { settingsMap[s.key] = JSON.parse(s.value) } catch { settingsMap[s.key] = s.value }
      }
      else settingsMap[s.key] = s.value
    }

    return NextResponse.json(settingsMap)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }

    const updates = Object.entries(body).map(([key, value]) => {
      let stringValue: string
      let type: string

      if (typeof value === 'boolean') {
        stringValue = String(value)
        type = 'boolean'
      } else if (typeof value === 'number') {
        stringValue = String(value)
        type = 'number'
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value)
        type = 'json'
      } else {
        stringValue = String(value)
        type = 'string'
      }

      return db.systemSetting.upsert({
        where: { key },
        create: { key, value: stringValue, type },
        update: { value: stringValue, type },
      })
    })

    await Promise.all(updates)

    return NextResponse.json({ message: 'Settings updated' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
