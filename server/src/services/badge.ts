import { prisma } from '../utils/db.js'
import { notificationService } from './notification.js'
import { logger } from '../utils/logger.js'

const CAP_TIERS = [
  { minBadges: 0, cap: 100 },
  { minBadges: 1, cap: 200 },
  { minBadges: 3, cap: 250 },
  { minBadges: 5, cap: 300 },
]

async function recalculateCap(userId: string): Promise<number> {
  const badgeCount = await prisma.badge.count({
    where: { userId, revokedAt: null },
  })

  let cap = CAP_TIERS[0].cap
  for (const tier of CAP_TIERS) {
    if (badgeCount >= tier.minBadges) {
      cap = tier.cap
    }
  }

  logger.info({ userId, badgeCount, cap }, 'Job cap recalculated')
  return cap
}

export const badgeService = {
  async issueBadge(workerId: string, badgeType: string, issuerId: string) {
    const bType = await prisma.badgeType.findUnique({ where: { name: badgeType } })
    if (!bType) throw new Error('Badge type not found')

    const badge = await prisma.badge.create({
      data: {
        userId: workerId,
        issuedById: issuerId,
        badgeTypeId: bType.id,
      },
    })

    const cap = await recalculateCap(workerId)
    await notificationService.notify(workerId, 'Badge Issued', `You received the "${badgeType}" badge! Your job cap is now ${cap}.`)

    return badge
  },

  async revokeBadge(badgeId: string, revokedBy: string) {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: { user: true, badgeType: true },
    })
    if (!badge) throw new Error('Badge not found')

    const updated = await prisma.badge.update({
      where: { id: badgeId },
      data: { revokedAt: new Date() },
    })

    const cap = await recalculateCap(badge.userId)
    await notificationService.notify(badge.userId, 'Badge Revoked', `Your "${badge.badgeType.name}" badge was revoked. Your job cap is now ${cap}.`)

    return updated
  },

  async getJobCap(userId: string): Promise<number> {
    return recalculateCap(userId)
  },
}
