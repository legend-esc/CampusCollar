import { prisma } from '../utils/db.js';

export const notificationService = {
  async notify(userId: string, title: string, body: string, type: string = 'INFO') {
    return prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        read: false,
      },
    });
  },

  async notifyJobStatus(jobId: string, status: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true, worker: true },
    });

    if (!job) return;

    const message = `Job "${job.title}" status changed to ${status}`;

    await this.notify(job.customerId, 'Job Update', message);
    if (job.workerId) {
      await this.notify(job.workerId, 'Job Update', message);
    }
  },
};
