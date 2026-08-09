import { DEFAULT_SETTINGS, type MenuItem, type Settings } from './types';

const BASE = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '').replace(/\/$/, '');

async function readNode<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/${path}.json`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    return (await res.json()) as T | null;
  } catch {
    return null;
  }
}

export async function getSettings(): Promise<Settings> {
  const data = await readNode<Partial<Settings>>('settings');
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
}

export async function getMenu(): Promise<MenuItem[]> {
  const data = await readNode<Record<string, Omit<MenuItem, 'id'>>>('menu');
  if (!data) return [];
  return Object.entries(data)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999) || a.nama.localeCompare(b.nama));
}
