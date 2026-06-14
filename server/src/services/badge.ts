import { prisma } from '../utils/db.js'

export const badgeService = {
  async issueBadge(workerId: string, badgeType: string, issuerId: string) {
    const bType = await prisma.badgeType.findUnique({ where: { name: badgeType } })
    if (!bType) throw new Error('Badge type not found')

    return prisma.badge.create({
      data: {
        userId: workerId,
        issuedById: issuerId,
        badgeTypeId: bType.id,
      },
    })
  },

  async revokeBadge(badgeId: string) {
    return prisma.badge.update({
      where: { id: badgeId },
      data: { revokedAt: new Date() },
    })
  },
}
