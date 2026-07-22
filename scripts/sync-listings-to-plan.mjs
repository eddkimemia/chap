import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const now = new Date()

  const users = await prisma.user.findMany({ select: { id: true, name: true, role: true } })
  const plans = await prisma.plan.findMany()
  const planBySlug = Object.fromEntries(plans.map(p => [p.slug, p]))

  console.log('Plans available:')
  for (const p of plans) {
    console.log(`  ${p.slug} -> name="${p.name}" featured=${p.isFeatured} promoted=${p.isPromoted} KES ${p.price}`)
  }

  // Delete existing subscriptions
  await prisma.subscription.deleteMany()
  console.log('\nCleared existing subscriptions')

  let created = 0
  for (const user of users) {
    // All users start on Free; upgrade via subscription
    const planSlug = 'free'

    const plan = planBySlug[planSlug]
    if (!plan) continue

    const startDate = new Date(now)
    const endDate = new Date(now)
    endDate.setFullYear(endDate.getFullYear() + 1)

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'active',
        startDate,
        endDate,
        autoRenew: true,
      },
    })
    created++
    console.log(`  ${user.name} (${user.role}) -> ${plan.name} plan`)
  }

  console.log(`\nCreated ${created} subscriptions`)

  // Now sync listings to match plans
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'active', endDate: { gte: now } },
    include: { plan: true },
  })

  console.log(`\nSyncing listings for ${subscriptions.length} active subscriptions...`)

  const planMap = new Map()
  for (const sub of subscriptions) {
    planMap.set(sub.userId, {
      isFeatured: sub.plan.isFeatured || false,
      isPromoted: sub.plan.isPromoted || false,
      planName: sub.plan.name,
      endDate: sub.endDate,
    })
  }

  const allUserIds = await prisma.listing.findMany({
    where: { userId: { not: undefined } },
    select: { userId: true },
    distinct: ['userId'],
  })

  let totalUpdated = 0
  for (const { userId } of allUserIds) {
    const planInfo = planMap.get(userId)
    const isFeatured = planInfo?.isFeatured || false
    const isPromoted = planInfo?.isPromoted || false
    const planName = planInfo?.planName || 'Free/None'
    const endDate = planInfo?.endDate || null

    const result = await prisma.listing.updateMany({
      where: { userId },
      data: {
        isFeatured,
        isPromoted,
        featuredUntil: isFeatured ? endDate : null,
        promotedUntil: isPromoted ? endDate : null,
        boostCount: 0,
        boostUntil: null,
      },
    })

    if (result.count > 0) {
      console.log(`  ${planName}: ${result.count} listings for user ${userId}`)
      totalUpdated += result.count
    }
  }

  console.log(`\nTotal listings updated: ${totalUpdated}`)
  console.log('Done.')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
