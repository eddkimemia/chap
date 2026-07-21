import { PrismaClient } from '@prisma/client'

export function formatDisplayId(seq: number, prefix = 'CHAP'): string {
  return `${prefix}-${String(seq).padStart(6, '0')}`
}

export async function nextDisplayId(db: PrismaClient, prefix = 'CHAP'): Promise<string> {
  const last = await db.listing.findMany({
    orderBy: { createdAt: 'desc' },
    select: { displayId: true },
    take: 1,
  })
  const lastNum = last[0]?.displayId
    ? parseInt(last[0].displayId.split('-')[1] || '0', 10)
    : 0
  return formatDisplayId(Math.max(lastNum, 0) + 1, prefix)
}
