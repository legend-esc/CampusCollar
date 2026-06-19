import { prisma } from '../utils/db.js';
import { notificationService } from './notification.js';

export const jobService = {
  async createJob(data: any, customerId: string) {
    const job = await prisma.job.create({
      data: {
        ...data,
        customerId,
        status: 'POSTED',
      },
    });
    await notificationService.notify(
      customerId,
      'Job Created',
      `Your job "${job.title}" has been posted successfully.`,
    );
    return job;
  },

  async fundJob(id: string) {
    const job = await prisma.job.update({ where: { id }, data: { status: 'FUNDED' } });
    await notificationService.notifyJobStatus(id, 'FUNDED');
    return job;
  },

  async acceptJob(id: string, workerId: string) {
    const job = await prisma.job.update({ where: { id }, data: { workerId, status: 'ACCEPTED' } });
    await notificationService.notifyJobStatus(id, 'ACCEPTED');
    return job;
  },

  async completeJob(id: string) {
    const job = await prisma.job.update({ where: { id }, data: { status: 'COMPLETED' } });
    await notificationService.notifyJobStatus(id, 'COMPLETED');
    return job;
  },

  async disputeJob(id: string, userId: string, reason: string) {
    await prisma.dispute.create({ data: { jobId: id, raisedBy: userId, reason, status: 'OPEN' } });
    const job = await prisma.job.update({ where: { id }, data: { status: 'DISPUTED' } });
    await notificationService.notifyJobStatus(id, 'DISPUTED');
    return job;
  },

  async cancelJob(id: string) {
    const job = await prisma.job.update({ where: { id }, data: { status: 'CANCELLED' } });
    await notificationService.notifyJobStatus(id, 'CANCELLED');
    return job;
  },
};
