import { prisma } from '../utils/db.js'

export const jobService = {
  async createJob(data: any, customerId: string) {
    return prisma.job.create({
      data: {
        ...data,
        customerId,
        status: 'POSTED',
      },
    })
  },

  async fundJob(id: string) {
    return prisma.job.update({ where: { id }, data: { status: 'FUNDED' } })
  },

  async acceptJob(id: string, workerId: string) {
    return prisma.job.update({ where: { id }, data: { workerId, status: 'ACCEPTED' } })
  },

  async completeJob(id: string) {
    return prisma.job.update({ where: { id }, data: { status: 'COMPLETED' } })
  },

  async disputeJob(id: string, userId: string, reason: string) {
    await prisma.dispute.create({ data: { jobId: id, raisedBy: userId, reason } })
    return prisma.job.update({ where: { id }, data: { status: 'DISPUTED' } })
  },

  async cancelJob(id: string) {
    return prisma.job.update({ where: { id }, data: { status: 'CANCELLED' } })
  },
}
