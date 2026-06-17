import { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import { useJobStore, JOB_CATEGORIES } from '../store/jobStore';
import JobList from '../components/job/JobList';
import JobForm from '../components/job/JobForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { JobCategory, JobStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const STATUSES: JobStatus[] = ['POSTED', 'FUNDED', 'ACCEPTED', 'IN_PROGRESS'];

export default function Jobs() {
  const { filters, setFilters, resetFilters } = useJobStore();
  const { data: jobs, isLoading } = useJobs(filters);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <Button onClick={() => setShowForm(true)}>+ Post a Job</Button>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <aside className="w-56 shrink-0 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Category</p>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="cat" checked={!filters.category} onChange={() => setFilters({ category: undefined })} />
                All
              </label>
              {JOB_CATEGORIES.map((c) => (
                <label key={c.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio" name="cat"
                    checked={filters.category === c.value}
                    onChange={() => setFilters({ category: c.value as JobCategory })}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</p>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="status" checked={!filters.status} onChange={() => setFilters({ status: undefined })} />
                All
              </label>
              {STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio" name="status"
                    checked={filters.status === s}
                    onChange={() => setFilters({ status: s })}
                  />
                  {s.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Max Price</p>
            <input
              type="range" min={5} max={150} step={5}
              value={filters.maxAmount ?? 150}
              onChange={(e) => setFilters({ maxAmount: Number(e.target.value) })}
              className="w-full accent-campus-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Up to ${filters.maxAmount ?? 150}</p>
          </div>

          <button onClick={resetFilters} className="text-xs text-gray-400 underline">Reset filters</button>
        </aside>

        {/* Job list */}
        <div className="flex-1">
          <div className="mb-4">
            <input
              type="search"
              placeholder="Search jobs…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campus-primary"
              value={filters.search ?? ''}
              onChange={(e) => setFilters({ search: e.target.value || undefined })}
            />
          </div>
          <JobList jobs={jobs} loading={isLoading} />
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Post a New Job">
        <JobForm
          onSuccess={(id) => { setShowForm(false); navigate(`/job/${id}`); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
