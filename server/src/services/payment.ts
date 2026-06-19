import { prisma } from '../utils/db.js';
import { WORKER_FEE } from '../utils/constants.js';

export const paymentService = {
  calculateFees(amount: number) {
    const fee = amount * WORKER_FEE;
    return { fee, workerAmount: amount - fee };
  },

  async releasePayment(jobId: string, _nfcToken: string) {
    return prisma.payment.update({
      where: { jobId },
      data: { status: 'RELEASED', releasedAt: new Date() },
    });
  },

  async recordTransaction(jobId: string, status: string, _workerId?: string) {
    return prisma.payment.update({
      where: { jobId },
      data: { status, updatedAt: new Date() },
    });
  },

  async refundCustomer(jobId: string) {
    return prisma.payment.update({
      where: { jobId },
      data: { status: 'REFUNDED' },
    });
  },
};
