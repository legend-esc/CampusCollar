import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';

interface Toggle {
  key: string;
  label: string;
  description: string;
}

const NOTIFICATION_TOGGLES: Toggle[] = [
  { key: 'jobAlerts', label: 'Job Alerts', description: 'New jobs matching your skills' },
  { key: 'messages', label: 'Messages', description: 'New chat messages' },
  {
    key: 'paymentUpdates',
    label: 'Payment Updates',
    description: 'Escrow and payout notifications',
  },
  { key: 'badgeUpdates', label: 'Badge Updates', description: 'Verification results' },
];

export default function Settings() {
  const { logout, user } = useAuthStore();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    jobAlerts: true,
    messages: true,
    paymentUpdates: true,
    badgeUpdates: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Account */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Account</h2>
        <Row label="Email" value={user?.email ?? '—'} />
        <Row label="Role" value={user?.role ?? '—'} />
      </section>

      {/* Notifications */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Notifications</h2>
        {NOTIFICATION_TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{t.label}</p>
              <p className="text-xs text-gray-400">{t.description}</p>
            </div>
            <button
              onClick={() => toggle(t.key)}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-campus-primary ${prefs[t.key] ? 'bg-campus-primary' : 'bg-gray-300'}`}
              role="switch"
              aria-checked={prefs[t.key]}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[t.key] ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        ))}
      </section>

      {/* Privacy */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Privacy</h2>
        <p className="text-sm text-gray-500">
          Your data is used only to operate CampusCollar. We never sell your information. Job photos
          are encrypted and stored on IPFS.
        </p>
      </section>

      {/* Danger zone */}
      <section className="bg-white border border-red-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-red-600">Danger Zone</h2>
        <Button variant="secondary" className="w-full" onClick={logout}>
          Sign Out
        </Button>
        {!showDeleteConfirm ? (
          <Button variant="danger" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-600 font-medium">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => alert('Account deletion coming soon')}
              >
                Yes, delete
              </Button>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}
