import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/utils/db.js';
import { jobService } from '../src/services/job.js';

const TEST_EMAIL = `jobtest_${Date.now()}@campus.edu`;
let userId: string;
let workerId: string;
let jobId: string;

describe('Job lifecycle', () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        passwordHash: 'x',
        name: 'Customer',
        university: 'Test U',
        emailVerified: true,
      },
    });
    const worker = await prisma.user.create({
      data: {
        email: `worker_${Date.now()}@campus.edu`,
        passwordHash: 'x',
        name: 'Worker',
        university: 'Test U',
        emailVerified: true,
      },
    });
    userId = user.id;
    workerId = worker.id;
  });

  afterAll(async () => {
    await prisma.dispute.deleteMany({ where: { job: { customerId: userId } } });
    await prisma.job.deleteMany({ where: { customerId: userId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, workerId] } } });
    await prisma.$disconnect();
  });

  it('createJob — creates a POSTED job', async () => {
    const job = await jobService.createJob(
      { title: 'Fix sink', description: 'Clogged drain', amount: 40 },
      userId,
    );
    expect(job.status).toBe('POSTED');
    expect(job.customerId).toBe(userId);
    jobId = job.id;
  });

  it('fundJob — transitions to FUNDED', async () => {
    const job = await jobService.fundJob(jobId);
    expect(job.status).toBe('FUNDED');
  });

  it('acceptJob — transitions to ACCEPTED with workerId', async () => {
    const job = await jobService.acceptJob(jobId, workerId);
    expect(job.status).toBe('ACCEPTED');
    expect(job.workerId).toBe(workerId);
  });

  it('completeJob — transitions to COMPLETED', async () => {
    const job = await jobService.completeJob(jobId);
    expect(job.status).toBe('COMPLETED');
  });

  it('disputeJob — creates dispute and sets DISPUTED status', async () => {
    // Create a fresh job for dispute test
    const job2 = await jobService.createJob(
      { title: 'Dispute test', description: 'x', amount: 30 },
      userId,
    );
    await jobService.fundJob(job2.id);
    await jobService.acceptJob(job2.id, workerId);
    const disputed = await jobService.disputeJob(job2.id, userId, 'Did not finish');
    expect(disputed.status).toBe('DISPUTED');
    const dispute = await prisma.dispute.findUnique({ where: { jobId: job2.id } });
    expect(dispute?.reason).toBe('Did not finish');
  });

  it('cancelJob — transitions to CANCELLED', async () => {
    const job3 = await jobService.createJob(
      { title: 'Cancel test', description: 'x', amount: 20 },
      userId,
    );
    const cancelled = await jobService.cancelJob(job3.id);
    expect(cancelled.status).toBe('CANCELLED');
  });
});
