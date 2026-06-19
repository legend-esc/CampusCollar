import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphql } from '../../services/api';
import { JobCategory } from '../../types';
import { JOB_CATEGORIES } from '../../store/jobStore';
import Button from '../common/Button';
import Input from '../common/Input';

const CREATE_JOB = `
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) { id title amount status }
  }
`;

interface JobFormProps {
  onSuccess?: (jobId: string) => void;
  onCancel?: () => void;
}

export default function JobForm({ onSuccess, onCancel }: JobFormProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'OTHER' as JobCategory,
    amount: 50,
    location: '',
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => graphql<{ createJob: { id: string } }>(CREATE_JOB, { input: form }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      onSuccess?.(data.createJob.id);
    },
    onError: (err: Error) => setError(err.message),
  });

  const set = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.amount > 150) {
      setError('Job amount cannot exceed $150');
      return;
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Job Title"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        required
        placeholder="e.g. Mount my TV on the wall"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campus-primary"
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          placeholder="Describe exactly what needs to be done..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campus-primary"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
        >
          {JOB_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Budget: <span className="font-bold text-campus-primary">${form.amount}</span>
        </label>
        <input
          type="range"
          min={5}
          max={150}
          step={5}
          value={form.amount}
          onChange={(e) => set('amount', Number(e.target.value))}
          className="w-full accent-campus-primary"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$5</span>
          <span>$150 max</span>
        </div>
      </div>
      <Input
        label="Location"
        value={form.location}
        onChange={(e) => set('location', e.target.value)}
        placeholder="e.g. Dorm A, Room 204"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={mutation.isPending} className="flex-1">
          Post Job
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
