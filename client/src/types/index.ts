export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export type JobStatus =
  | 'POSTED'
  | 'FUNDED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAID'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BadgeType =
  | 'RELIABLE'
  | 'FAST_DELIVERY'
  | 'TOP_RATED'
  | 'VERIFIED_STUDENT'
  | 'VERIFIED_STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  university: string;
  role: UserRole;
  trustScore: number;
  stellarPubkey?: string;
  completionRate: number;
  rating: number;
  jobsPosted: number;
  jobsAccepted: number;
  createdAt: string;
  badges: UserBadge[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  status: JobStatus;
  location: string;
  customerId: string;
  workerId?: string;
  customer: User;
  worker?: User;
  createdAt: string;
  updatedAt: string;
  escrowAddress?: string;
  messages: Message[];
  payment?: Payment;
}

export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  escrowAddr?: string;
  status: string;
  nfcChallenge?: string;
  releasedAt?: string;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  badge: {
    id: string;
    name: string;
    type: BadgeType;
    issuer: User;
    issuedAt: string;
    revokedAt?: string;
  };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
}

export type JobCategory =
  | 'TUTORING'
  | 'DELIVERY'
  | 'TECH_HELP'
  | 'CLEANING'
  | 'MOVING'
  | 'DESIGN'
  | 'WRITING'
  | 'OTHER';

export interface JobFilter {
  category?: JobCategory;
  status?: JobStatus;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
}
