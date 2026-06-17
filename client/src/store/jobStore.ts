import { create } from 'zustand';
import { JobFilter, JobStatus, JobCategory } from '../types';

interface JobState {
  filters: JobFilter;
  selectedJobId: string | null;
  page: number;
  setFilters: (filters: Partial<JobFilter>) => void;
  resetFilters: () => void;
  setSelectedJob: (id: string | null) => void;
  setPage: (page: number) => void;
}

const defaultFilters: JobFilter = {
  page: 1,
  limit: 20,
};

export const useJobStore = create<JobState>((set) => ({
  filters: defaultFilters,
  selectedJobId: null,
  page: 1,

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters, page: 1 }, page: 1 })),

  resetFilters: () => set({ filters: defaultFilters, page: 1 }),

  setSelectedJob: (id) => set({ selectedJobId: id }),

  setPage: (page) => set((s) => ({ page, filters: { ...s.filters, page } })),
}));

export const JOB_CATEGORIES: { value: JobCategory; label: string }[] = [
  { value: 'TUTORING', label: 'Tutoring' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'TECH_HELP', label: 'Tech Help' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'MOVING', label: 'Moving' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'OTHER', label: 'Other' },
];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  POSTED: 'Open',
  FUNDED: 'Funded',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  PAID: 'Paid',
  DISPUTED: 'Disputed',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  POSTED: 'bg-blue-100 text-blue-700',
  FUNDED: 'bg-indigo-100 text-indigo-700',
  ACCEPTED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  DISPUTED: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  EXPIRED: 'bg-gray-100 text-gray-500',
};
