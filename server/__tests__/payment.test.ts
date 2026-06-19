import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/utils/db.js';
import { paymentService } from '../src/services/payment.js';
import { WORKER_FEE } from '../src/utils/constants.js';

let customerId: string;
let workerId: string;
let jobId: string;

describe('Payment service', () => {
  beforeAll(async () => {
    const customer = await prisma.user.create({
      data: {
        email: `pay_c_${Date.now()}@campus.edu`,
        passwordHash: 'x',
        name: 'C',
        university: 'U',
        emailVerified: true,
      },
    });
    const worker = await prisma.user.create({
      data: {
        email: `pay_w_${Date.now()}@campus.edu`,
        passwordHash: 'x',
        name: 'W',
        university: 'U',
        emailVerified: true,
      },
    });
    customerId = customer.id;
    workerId = worker.id;

    const job = await prisma.job.create({
      data: {
        title: 'Pay test',
        description: 'x',
        amount: 100,
        customerId,
        workerId,
        status: 'COMPLETED',
      },
    });
    jobId = job.id;

    await prisma.payment.create({
      data: { jobId, amount: 100, customerId, status: 'FUNDED' },
    });
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { jobId } });
    await prisma.job.deleteMany({ where: { id: jobId } });
    await prisma.user.deleteMany({ where: { id: { in: [customerId, workerId] } } });
    await prisma.$disconnect();
  });

  it('calculateFees — deducts WORKER_FEE correctly', () => {
    const { workerAmount, fee } = paymentService.calculateFees(100);
    expect(fee).toBeCloseTo(100 * WORKER_FEE);
    expect(workerAmount).toBeCloseTo(100 * (1 - WORKER_FEE));
  });

  it('recordTransaction — creates payment record', async () => {
    const result = await paymentService.recordTransaction(jobId, 'RELEASED', workerId);
    expect(result.status).toBe('RELEASED');
  });
});
