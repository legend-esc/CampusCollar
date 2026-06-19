import { Job } from '../../types';
import JobCard from './JobCard';

export default function JobList({ jobs, loading }: { jobs: Job[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  if (!jobs?.length) {
    return (
      <div className="py-16 text-center text-gray-400">No jobs found matching your filters.</div>
    );
  }
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
