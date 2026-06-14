import { prisma } from '../utils/db.js'

export const paymentService = {
  async releasePayment(jobId: string, nfcToken: string) {
    // Stub for Day 7 NFC validation and Stellar release
    return prisma.payment.update({
      where: { jobId },
      data: { status: 'RELEASED', releasedAt: new Date() },
    })
  },
}
