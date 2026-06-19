import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '../config.js';
import { prisma } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { notificationService } from '../services/notification.js';

const redisConnection = new Redis(config.redis.url) as any;

export const disputeQueue = new Queue('dispute-resolution', { connection: redisConnection });

const worker = new Worker(
  'dispute-resolution',
  async () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const staleDisputes = await prisma.dispute.findMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: cutoff },
      },
      include: { job: true },
    });

    for (const dispute of staleDisputes) {
      const { job } = dispute;
      const amount = job.amount;
      const half = amount / 2;

      await prisma.$transaction(async (tx) => {
        await tx.dispute.update({
          where: { id: dispute.id },
          data: { status: 'RESOLVED', winnerId: null, resolvedAt: new Date() },
        });

        await tx.job.update({
          where: { id: job.id },
          data: { status: 'RESOLVED' },
        });

        await tx.payment.update({
          where: { jobId: job.id },
          data: { status: 'SPLIT' },
        });
      });

      await notificationService.notify(
        job.customerId,
        'Dispute Resolved',
        `Your dispute for job "${job.title}" has been auto-resolved. Escrow split 50/50.`,
      );
      if (job.workerId) {
        await notificationService.notify(
          job.workerId,
          'Dispute Resolved',
          `Your dispute for job "${job.title}" has been auto-resolved. Escrow split 50/50.`,
        );
      }

      logger.info({ jobId: job.id, disputeId: dispute.id }, 'Dispute auto-resolved');
    }

    return { resolved: staleDisputes.length };
  },
  { connection: redisConnection },
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.id, result: job.returnvalue }, 'Dispute job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Dispute job failed');
});

export async function scheduleDisputeCheck() {
  await disputeQueue.upsertJobScheduler('dispute-check', {
    pattern: '0 */6 * * *',
    immediately: true,
  });
}
