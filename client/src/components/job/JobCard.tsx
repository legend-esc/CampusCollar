import { Job } from '../../types';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '../../store/jobStore';
import { Link } from 'react-router-dom';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CATEGORY_ICONS: Record<string, string> = {
  TUTORING: '📚',
  DELIVERY: '📦',
  TECH_HELP: '💻',
  CLEANING: '🧹',
  MOVING: '📦',
  DESIGN: '🎨',
  WRITING: '✍️',
  OTHER: '🔧',
};

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/job/${job.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{CATEGORY_ICONS[job.category] ?? '🔧'}</span>
          <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${JOB_STATUS_COLORS[job.status]}`}
        >
          {JOB_STATUS_LABELS[job.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{job.description}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-bold text-campus-primary text-lg">${job.amount}</span>
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          {job.location && <span>📍 {job.location}</span>}
          <span>{timeAgo(job.createdAt)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        by {job.customer.name} · {job.customer.university}
      </div>
    </Link>
  );
}
