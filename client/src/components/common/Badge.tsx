interface BadgeProps {
  name: string;
  tier?: number;
  size?: 'sm' | 'lg';
  revoked?: boolean;
}

const tierColors: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  2: 'bg-gray-100 text-gray-800 border-gray-200',
  3: 'bg-amber-100 text-amber-800 border-amber-200',
};

const tierIcons: Record<number, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
};

export default function Badge({ name, tier = 1, size = 'sm', revoked }: BadgeProps) {
  const colorClass = tierColors[tier] || tierColors[1];
  const icon = tierIcons[tier] || tierIcons[1];

  return (
    <div
      className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-4 py-1.5 text-sm'
      } ${colorClass} ${revoked ? 'opacity-50 line-through' : ''}`}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </div>
  );
}
