import { useQuery } from '@tanstack/react-query';
import { useStellar } from '../hooks/useStellar';
import { apiFetch } from '../services/api';
import WalletBalance from '../components/payment/WalletBalance';
import Button from '../components/common/Button';
import { Transaction } from '../types';

export default function Wallet() {
  const { pubkey, balance, connected, connecting, connect, error } = useStellar();

  const { data: txns, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => apiFetch('/api/payments/transactions'),
    enabled: connected,
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>

      <WalletBalance balance={balance} pubkey={pubkey} loading={connecting} />

      {!connected && (
        <Button onClick={connect} loading={connecting} className="w-full" size="lg">
          Connect Stellar Wallet
        </Button>
      )}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {connected && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="w-full" onClick={() => alert('Deposit coming soon')}>⬇️ Deposit</Button>
          <Button variant="secondary" className="w-full" onClick={() => alert('Withdraw coming soon')}>⬆️ Withdraw</Button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Transaction History</h2>
        </div>
        {txLoading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : !txns?.length ? (
          <p className="p-5 text-sm text-gray-400 text-center">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {txns.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
