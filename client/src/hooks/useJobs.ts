import { useQuery } from '@tanstack/react-query';
import { graphql } from '../services/api';
import { Job, JobFilter } from '../types';

const JOBS_QUERY = `
  query GetJobs($filter: JobFilter) {
    jobs(filter: $filter) {
      id
      title
      description
      category
      amount
      status
      location
      createdAt
      updatedAt
      customer {
        id
        name
        university
        trustScore
        rating
      }
      worker {
        id
        name
      }
    }
  }
`;

interface JobsData {
  jobs: Job[];
}

export function useJobs(filters?: JobFilter) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => graphql<JobsData>(JOBS_QUERY, { filter: filters }),
    select: (data) => data.jobs,
    staleTime: 30_000,
  });
}
