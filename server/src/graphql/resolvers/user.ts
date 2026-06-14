import type { GraphQLContext } from '../context.js'

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, { userId, prisma }: GraphQLContext) => {
      if (!userId) return null
      return prisma.user.findUnique({ where: { id: userId } })
    },
    user: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {
      return prisma.user.findUnique({ where: { id } })
    },
  },
  User: {
    jobsPosted: async (user: any, _: any, { loaders }: GraphQLContext) => {
      const jobs = await loaders.userJobs.load(user.id)
      return jobs.filter((j) => j.customerId === user.id)
    },
    jobsAccepted: async (user: any, _: any, { loaders }: GraphQLContext) => {
      const jobs = await loaders.userJobs.load(user.id)
      return jobs.filter((j) => j.workerId === user.id)
    },
    badges: async (user: any, _: any, { prisma }: GraphQLContext) => {
      return prisma.badge.findMany({ where: { userId: user.id } })
    },
    skills: async (user: any, _: any, { prisma }: GraphQLContext) => {
      return prisma.userSkill.findMany({ where: { userId: user.id } })
    },
  },
}
