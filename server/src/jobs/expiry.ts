import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '../config.js';
import { prisma } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { JOB_EXPIRY_HOURS } from '../utils/constants.js';

const redisConnection = new Redis(config.redis.url) as any;

export const expiryQueue = new Queue('job-expiry', { connection: redisConnection });

const worker = new Worker(
  'job-expiry',
  async () => {
    const cutoff = new Date(Date.now() - JOB_EXPIRY_HOURS * 60 * 60 * 1000);

    const expiredJobs = await prisma.job.findMany({
      where: {
        status: 'POSTED',
        createdAt: { lt: cutoff },
      },
    });

    for (const job of expiredJobs) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'EXPIRED' },
      });

      logger.info({ jobId: job.id }, 'Job expired');
    }

    return { expired: expiredJobs.length };
  },
  { connection: redisConnection },
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.id, result: job.returnvalue }, 'Expiry job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Expiry job failed');
});

export async function scheduleExpiryCheck() {
  await expiryQueue.upsertJobScheduler('expiry-check', {
    pattern: '*/15 * * * *',
    immediately: true,
  });
}
