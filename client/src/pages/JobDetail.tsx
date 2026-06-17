import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '../hooks/useJob';
import { useAuthStore } from '../store/authStore';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '../store/jobStore';
import EscrowStatus from '../components/payment/EscrowStatus';
import NFCTapButton from '../components/payment/NFCTapButton';
import ChatWindow from '../components/chat/ChatWindow';
import RatingStars from '../components/profile/RatingStars';
import Button from '../components/common/Button';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error, accept, complete, cancel, dispute } = useJob(id);
  const user = useAuthStore((s) => s.user);

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded" /><div className="h-40 bg-gray-100 rounded" /></div>;
  if (error || !job) return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-red-500">{error?.message ?? 'Job not found'}</div>;

  const isCustomer = user?.id === job.customerId;
  const isWorker = user?.id === job.workerId;
  const canAccept = job.status === 'FUNDED' && !isCustomer && !isWorker;
  const canRelease = isCustomer && ['COMPLETED', 'IN_PROGRESS'].includes(job.status);
  const canCancel = isCustomer && ['POSTED', 'FUNDED'].includes(job.status);
  const canDispute = (isCustomer || isWorker) && job.status === 'IN_PROGRESS';

  const handleRelease = async (challenge: string) => {
    await complete.mutateAsync();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{job.location}</p>
        </div>
        <span className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${JOB_STATUS_COLORS[job.status]}`}>
          {JOB_STATUS_LABELS[job.status]}
        </span>
      </div>

      {/* Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <p className="text-gray-700">{job.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-campus-primary">${job.amount}</span>
          <span className="text-sm text-gray-400">{job.category.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Escrow */}
      <EscrowStatus payment={job.payment} jobStatus={job.status} />

      {/* Parties */}
      <div className="grid grid-cols-2 gap-4">
        <PartyCard label="Customer" user={job.customer} />
        {job.worker && <PartyCard label="Worker" user={job.worker} />}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {canAccept && (
          <Button onClick={() => accept.mutate()} loading={accept.isPending} className="w-full" size="lg">
            Accept Job
          </Button>
        )}
        {canRelease && (
          <NFCTapButton jobId={job.id} onSuccess={handleRelease} disabled={complete.isPending} />
        )}
        {canCancel && (
          <Button variant="danger" onClick={() => cancel.mutate()} loading={cancel.isPending} className="w-full">
            Cancel Job
          </Button>
        )}
        {canDispute && (
          <Button variant="secondary" onClick={() => dispute.mutate()} loading={dispute.isPending} className="w-full">
            Raise Dispute
          </Button>
        )}
      </div>

      {/* Chat */}
      {['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED'].includes(job.status) && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Chat</h2>
          <ChatWindow jobId={job.id} initialMessages={job.messages} />
        </div>
      )}
    </div>
  );
}

function PartyCard({ label, user }: { label: string; user: { name: string; university?: string; rating?: number; trustScore?: number } }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{user.name}</p>
      {user.university && <p className="text-xs text-gray-500">{user.university}</p>}
      {user.rating !== undefined && <RatingStars rating={user.rating} />}
    </div>
  );
}
