import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphql } from '../services/api';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import ProfileCard from '../components/profile/ProfileCard';
import BadgeDisplay from '../components/profile/BadgeDisplay';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ME_QUERY = `query { me { id email name university role trustScore rating completionRate jobsPosted jobsAccepted createdAt badges { id badge { id name type issuedAt issuer { id name } } } } }`;
const UPDATE_ME = `mutation UpdateMe($input: UpdateUserInput!) { updateMe(input: $input) { id name university } }`;

export default function Profile() {
  const qc = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', university: '' });

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => graphql<{ me: User }>(ME_QUERY).then((d) => d.me),
  });

  const update = useMutation({
    mutationFn: () => graphql(UPDATE_ME, { input: form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); setEditing(false); },
  });

  if (isLoading) return <div className="max-w-xl mx-auto px-4 py-12 space-y-4"><div className="h-48 bg-gray-100 rounded-xl animate-pulse" /></div>;
  if (!user) return null;

  const startEdit = () => { setForm({ name: user.name, university: user.university }); setEditing(true); };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <ProfileCard user={user} />

      {editing ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Edit Profile</h2>
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="University" value={form.university} onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))} />
          <div className="flex gap-3">
            <Button onClick={() => update.mutate()} loading={update.isPending}>Save</Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={startEdit} className="w-full">Edit Profile</Button>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Badges</h2>
        <BadgeDisplay badges={user.badges} size="lg" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
        <h2 className="font-semibold text-gray-800 mb-2">Stats</h2>
        <Row label="Email" value={user.email} />
        <Row label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
        <Row label="Jobs posted" value={String(user.jobsPosted)} />
        <Row label="Jobs completed" value={String(user.jobsAccepted)} />
        <Row label="Completion rate" value={`${Math.round(user.completionRate * 100)}%`} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
