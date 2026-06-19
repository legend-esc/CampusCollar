interface WalletBalanceProps {
  balance: string | null;
  pubkey: string | null;
  loading?: boolean;
}

export default function WalletBalance({ balance, pubkey, loading }: WalletBalanceProps) {
  if (loading) return <div className="h-24 bg-gray-100 animate-pulse rounded-xl" />;
  return (
    <div className="bg-gradient-to-br from-campus-primary to-campus-secondary rounded-xl p-6 text-white">
      <p className="text-sm opacity-80">USDC Balance</p>
      <p className="text-4xl font-bold mt-1">
        {balance ? `$${parseFloat(balance).toFixed(2)}` : '—'}
      </p>
      {pubkey && (
        <p className="text-xs opacity-60 mt-3 font-mono truncate">
          {pubkey.slice(0, 8)}…{pubkey.slice(-6)}
        </p>
      )}
    </div>
  );
}
