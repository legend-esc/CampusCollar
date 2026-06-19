import { prisma } from '../utils/db.js';
import DataLoader from 'dataloader';
import type { User, Message, Job } from '@prisma/client';

export interface GraphQLContext {
  userId?: string;
  prisma: typeof prisma;
  loaders: {
    user: DataLoader<string, User | null>;
    jobMessages: DataLoader<string, Message[]>;
    userJobs: DataLoader<string, Job[]>;
  };
}

export const createLoaders = () => ({
  user: new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => userMap.get(id) || null);
  }),
  jobMessages: new DataLoader(async (jobIds: readonly string[]) => {
    const messages = await prisma.message.findMany({
      where: { jobId: { in: jobIds as string[] } },
      orderBy: { createdAt: 'asc' },
    });
    return jobIds.map((id) => messages.filter((m) => m.jobId === id));
  }),
  userJobs: new DataLoader(async (userIds: readonly string[]) => {
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { customerId: { in: userIds as string[] } },
          { workerId: { in: userIds as string[] } },
        ],
      },
    });
    return userIds.map((id) => jobs.filter((j) => j.customerId === id || j.workerId === id));
  }),
});
