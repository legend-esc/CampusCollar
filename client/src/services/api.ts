import { useAuthStore } from '../store/authStore';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    await useAuthStore.getState().refreshTokenAction();
    const newToken = useAuthStore.getState().accessToken;
    if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
    const retry = await fetch(path, { ...options, headers });
    if (!retry.ok) {
      const err = await retry.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return retry.json();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}
