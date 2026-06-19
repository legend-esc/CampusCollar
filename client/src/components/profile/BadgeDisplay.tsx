import { UserBadge } from '../../types';

const BADGE_COLORS: Record<string, string> = {
  RELIABLE: 'bg-blue-100 text-blue-700',
  FAST_DELIVERY: 'bg-green-100 text-green-700',
  TOP_RATED: 'bg-yellow-100 text-yellow-800',
  VERIFIED_STUDENT: 'bg-indigo-100 text-indigo-700',
  VERIFIED_STAFF: 'bg-purple-100 text-purple-700',
};

const BADGE_ICONS: Record<string, string> = {
  RELIABLE: '🛠️',
  FAST_DELIVERY: '⚡',
  TOP_RATED: '⭐',
  VERIFIED_STUDENT: '🎓',
  VERIFIED_STAFF: '🏛️',
};

export default function BadgeDisplay({
  badges,
  size = 'sm',
}: {
  badges: UserBadge[];
  size?: 'sm' | 'lg';
}) {
  if (!badges.length) return <span className="text-xs text-gray-400">No badges yet</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((ub) => (
        <span
          key={ub.id}
          className={`inline-flex items-center gap-1 font-medium rounded-full ${BADGE_COLORS[ub.badge.type] ?? 'bg-gray-100 text-gray-600'} ${size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'}`}
          title={`Issued by ${ub.badge.issuer?.name}`}
        >
          <span>{BADGE_ICONS[ub.badge.type] ?? '🏅'}</span>
          {ub.badge.name}
        </span>
      ))}
    </div>
  );
}
