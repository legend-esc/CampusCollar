import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphql } from '../services/api';
import { Job } from '../types';

const JOB_QUERY = `
  query GetJob($id: ID!) {
    job(id: $id) {
      id title description category amount status location createdAt updatedAt escrowAddress
      customer { id name university trustScore rating }
      worker { id name university }
      messages { id content createdAt sender { id name } }
      payment { id amount status escrowAddr nfcChallenge releasedAt }
    }
  }
`;

const ACCEPT_JOB = `mutation AcceptJob($id: ID!) { acceptJob(id: $id) { id status worker { id name } } }`;
const COMPLETE_JOB = `mutation CompleteJob($id: ID!) { completeJob(id: $id) { id status } }`;
const CANCEL_JOB = `mutation CancelJob($id: ID!) { cancelJob(id: $id) { id status } }`;
const DISPUTE_JOB = `mutation DisputeJob($id: ID!) { disputeJob(id: $id) { id status } }`;

export function useJob(id: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['job', id],
    queryFn: () => graphql<{ job: Job }>(JOB_QUERY, { id }).then((d) => d.job),
    enabled: !!id,
    staleTime: 15_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['job', id] });
    qc.invalidateQueries({ queryKey: ['jobs'] });
  };

  const accept = useMutation({
    mutationFn: () => graphql(ACCEPT_JOB, { id }),
    onSuccess: invalidate,
  });

  const complete = useMutation({
    mutationFn: () => graphql(COMPLETE_JOB, { id }),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: () => graphql(CANCEL_JOB, { id }),
    onSuccess: invalidate,
  });

  const dispute = useMutation({
    mutationFn: () => graphql(DISPUTE_JOB, { id }),
    onSuccess: invalidate,
  });

  return { ...query, accept, complete, cancel, dispute };
}
