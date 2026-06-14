import type { GraphQLContext } from '../context.js'
import { jobService } from '../../services/job.js'

export const jobResolvers = {
  Query: {
    jobs: async (_: any, { filters }: any, { prisma }: GraphQLContext) => {
      const where: any = {}
      if (filters?.status) where.status = filters.status
      if (filters?.category) where.category = filters.category
      if (filters?.customerId) where.customerId = filters.customerId
      if (filters?.workerId) where.workerId = filters.workerId
      return prisma.job.findMany({ where, orderBy: { createdAt: 'desc' } })
    },
    job: async (_: any, { id }: { id: string }, { prisma }: GraphQLContext) => {
      return prisma.job.findUnique({ where: { id } })
    },
  },
  Mutation: {
    createJob: async (_: any, args: any, { userId }: GraphQLContext) => {
      if (!userId) throw new Error('Unauthorized')
      return jobService.createJob(args, userId)
    },
    fundJob: async (_: any, { id }: { id: string }) => {
      return jobService.fundJob(id)
    },
    acceptJob: async (_: any, { id }: { id: string }, { userId }: GraphQLContext) => {
      if (!userId) throw new Error('Unauthorized')
      return jobService.acceptJob(id, userId)
    },
    completeJob: async (_: any, { id }: { id: string }) => {
      return jobService.completeJob(id)
    },
    disputeJob: async (_: any, { id, reason }: any, { userId }: GraphQLContext) => {
      if (!userId) throw new Error('Unauthorized')
      return jobService.disputeJob(id, userId, reason)
    },
    cancelJob: async (_: any, { id }: { id: string }) => {
      return jobService.cancelJob(id)
    },
  },
  Subscription: {
    jobStatusChanged: {
      subscribe: () => {
        throw new Error('Subscriptions not implemented yet')
      },
    },
    newMessage: {
      subscribe: () => {
        throw new Error('Subscriptions not implemented yet')
      },
    },
  },
  Job: {
    customer: async (job: any, _: any, { loaders }: GraphQLContext) => {
      return loaders.user.load(job.customerId)
    },
    worker: async (job: any, _: any, { loaders }: GraphQLContext) => {
      if (!job.workerId) return null
      return loaders.user.load(job.workerId)
    },
    messages: async (job: any, _: any, { loaders }: GraphQLContext) => {
      return loaders.jobMessages.load(job.id)
    },
    payment: async (job: any, _: any, { prisma }: GraphQLContext) => {
      return prisma.payment.findUnique({ where: { jobId: job.id } })
    },
    dispute: async (job: any, _: any, { prisma }: GraphQLContext) => {
      return prisma.dispute.findUnique({ where: { jobId: job.id } })
    },
  },
  Message: {
    sender: async (message: any, _: any, { loaders }: GraphQLContext) => {
      return loaders.user.load(message.senderId)
    },
  },
}
