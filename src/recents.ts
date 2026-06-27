import { load } from '@tauri-apps/plugin-store';

const KEY = 'recents';
const MAX = 8;

export function mergeRecent(list: string[], path: string, max: number): string[] {
  return [path, ...list.filter((p) => p !== path)].slice(0, max);
}

async function store() {
  return load('markrig.json', { autoSave: true });
}

export async function getRecents(): Promise<string[]> {
  const s = await store();
  return (await s.get<string[]>(KEY)) ?? [];
}

export async function addRecent(path: string): Promise<void> {
  const s = await store();
  const current = (await s.get<string[]>(KEY)) ?? [];
  await s.set(KEY, mergeRecent(current, path, MAX));
}
