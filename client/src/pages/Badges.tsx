import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphql } from '../services/api';
import { BadgeType, UserBadge } from '../types';
import Button from '../components/common/Button';

const BADGES_QUERY = `query { me { badges { id badge { id name type issuedAt revokedAt issuer { id name } } } } }`;
const REQUEST_BADGE = `mutation RequestBadge($type: BadgeType!) { requestBadgeVerification(type: $type) { id } }`;

const ALL_BADGE_TYPES: { type: BadgeType; name: string; icon: string; description: string }[] = [
  { type: 'RELIABLE', name: 'Reliable', icon: '🛠️', description: 'Complete 5 jobs with 4.5★+' },
  {
    type: 'FAST_DELIVERY',
    name: 'Fast Delivery',
    icon: '⚡',
    description: 'Respond within 30 min on 10 jobs',
  },
  { type: 'TOP_RATED', name: 'Top Rated', icon: '⭐', description: '50+ jobs with 4.8★+ rating' },
  {
    type: 'VERIFIED_STUDENT',
    name: 'Verified Student',
    icon: '🎓',
    description: 'Campus ID verified by staff',
  },
  {
    type: 'VERIFIED_STAFF',
    name: 'Verified Staff',
    icon: '🏛️',
    description: 'Verified campus staff member',
  },
];

const TIER_COLORS: Record<string, string> = {
  VERIFIED_STAFF: 'border-purple-200 bg-purple-50',
  TOP_RATED: 'border-yellow-200 bg-yellow-50',
  VERIFIED_STUDENT: 'border-indigo-200 bg-indigo-50',
  RELIABLE: 'border-blue-200 bg-blue-50',
  FAST_DELIVERY: 'border-green-200 bg-green-50',
};

export default function Badges() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => graphql<{ me: { badges: UserBadge[] } }>(BADGES_QUERY).then((d) => d.me.badges),
  });

  const request = useMutation({
    mutationFn: (type: BadgeType) => graphql(REQUEST_BADGE, { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-badges'] }),
  });

  const earnedTypes = new Set(data?.map((ub) => ub.badge.type) ?? []);

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 grid grid-cols-2 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Skill Badges</h1>
      <p className="text-sm text-gray-500 mb-6">
        Badges are earned — not bought. Campus staff verify real-world competence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ALL_BADGE_TYPES.map((b) => {
          const earned = earnedTypes.has(b.type);
          return (
            <div
              key={b.type}
              className={`rounded-xl border p-5 space-y-3 ${earned ? (TIER_COLORS[b.type] ?? 'border-gray-200 bg-gray-50') : 'border-gray-200 bg-white opacity-70'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{b.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{b.name}</h3>
                  <p className="text-xs text-gray-500">{b.description}</p>
                </div>
              </div>
              {earned ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  ✓ Earned
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => request.mutate(b.type)}
                  loading={request.isPending && request.variables === b.type}
                  className="w-full"
                >
                  Request Verification
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
