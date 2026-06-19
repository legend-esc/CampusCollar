import { Payment } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  FUNDED: 'bg-blue-100 text-blue-700',
  RELEASED: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-gray-100 text-gray-500',
  DISPUTED: 'bg-red-100 text-red-700',
};

const STEPS = ['Funded', 'Accepted', 'In Progress', 'Released'];

export default function EscrowStatus({
  payment,
  jobStatus,
}: {
  payment?: Payment;
  jobStatus: string;
}) {
  const stepIndex =
    jobStatus === 'FUNDED'
      ? 0
      : jobStatus === 'ACCEPTED'
        ? 1
        : jobStatus === 'IN_PROGRESS'
          ? 2
          : ['COMPLETED', 'PAID'].includes(jobStatus)
            ? 3
            : -1;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Escrow</span>
        {payment && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[payment.status] ?? 'bg-gray-100 text-gray-500'}`}
          >
            {payment.status}
          </span>
        )}
      </div>
      {payment && (
        <p className="text-2xl font-bold text-campus-primary">
          ${payment.amount.toFixed(2)}{' '}
          <span className="text-sm font-normal text-gray-400">USDC</span>
        </p>
      )}
      {stepIndex >= 0 && (
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1 flex-1 last:flex-none">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? 'bg-campus-primary text-white' : 'bg-gray-200 text-gray-400'}`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span
                className={`hidden sm:block text-xs ${i <= stepIndex ? 'text-campus-primary font-medium' : 'text-gray-400'}`}
              >
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${i < stepIndex ? 'bg-campus-primary' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
