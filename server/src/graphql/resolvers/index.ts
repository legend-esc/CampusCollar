import { userResolvers } from './user.js';
import { jobResolvers } from './job.js';
import { paymentResolvers } from './payment.js';
import { badgeResolvers } from './badge.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...jobResolvers.Query,
    ...badgeResolvers.Query,
  },
  Mutation: {
    ...jobResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...badgeResolvers.Mutation,
  },
  Subscription: jobResolvers.Subscription,
  User: userResolvers.User,
  Job: jobResolvers.Job,
  Message: jobResolvers.Message,
  Badge: badgeResolvers.Badge,
};
