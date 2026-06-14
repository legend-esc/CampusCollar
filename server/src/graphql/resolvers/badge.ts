import type { GraphQLContext } from '../context.js'
import { badgeService } from '../../services/badge.js'

export const badgeResolvers = {
  Query: {
    badges: async (_: any, __: any, { prisma }: GraphQLContext) => {
      return prisma.badge.findMany({ include: { badgeType: true } })
    },
  },
  Mutation: {
    issueBadge: async (_: any, { workerId, badgeType }: any, { userId }: GraphQLContext) => {
      if (!userId) throw new Error('Unauthorized')
      return badgeService.issueBadge(workerId, badgeType, userId)
    },
    revokeBadge: async (_: any, { badgeId }: { badgeId: string }) => {
      return badgeService.revokeBadge(badgeId)
    },
  },
  Badge: {
    name: (badge: any) => badge.badgeType?.name || '',
    type: (badge: any) => badge.badgeType?.name || '',
    issuer: async (badge: any, _: any, { loaders }: GraphQLContext) => {
      return loaders.user.load(badge.issuedById)
    },
  },
}
