import { User } from '../../types';
import RatingStars from './RatingStars';

export default function ProfileCard({ user }: { user: User }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-campus-primary flex items-center justify-center text-white text-xl font-bold">
        {initials}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.university}</p>
        <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
      </div>
      <RatingStars rating={user.rating} count={user.jobsAccepted} />
      <div className="w-full grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-3 mt-1">
        <Stat label="Trust" value={`${Math.round(user.trustScore * 100)}%`} />
        <Stat label="Jobs" value={String(user.jobsAccepted)} />
        <Stat label="Done" value={`${Math.round(user.completionRate * 100)}%`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-2">
      <span className="font-semibold text-gray-800 text-sm">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
