import type { GraphQLContext } from '../context.js';
import { paymentService } from '../../services/payment.js';

export const paymentResolvers = {
  Mutation: {
    releasePayment: async (_: any, { jobId, nfcToken }: any) => {
      return paymentService.releasePayment(jobId, nfcToken);
    },
  },
};
