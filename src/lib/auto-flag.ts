import { db } from './db'

const BANNED_WORDS = [
  'cocaine', 'heroin', 'weed', 'marijuana', 'cannabis',
  'gun', 'firearm', 'ammunition', 'weapon',
  'counterfeit', 'fake money', 'passport',
  'kidney', 'organ donor',
  'hacker', 'hack service',
  'credit card dumps',
]

export async function autoFlag(title: string, description: string, userId: string, listingId: string): Promise<void> {
  const lowerTitle = title.toLowerCase()
  const lowerDesc = description.toLowerCase()
  const combined = lowerTitle + ' ' + lowerDesc

  for (const word of BANNED_WORDS) {
    if (combined.includes(word)) {
      await db.moderationLog.create({
        data: {
          userId,
          listingId,
          action: 'auto_flagged',
          reason: `Auto-flagged: contains banned word "${word}"`,
          details: JSON.stringify({ matchedWord: word }),
        },
      })

      await db.listing.update({
        where: { id: listingId },
        data: { status: 'suspended' },
      })
      return
    }
  }
}
