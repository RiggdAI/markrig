import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { TreeNode } from './types';

const NOT_IN_TAURI =
  'markrig must run as the desktop app. Start it with `npm run tauri dev` (or the installed app) — opening localhost:1420 in a browser has no filesystem access.';

// The Tauri runtime injects `__TAURI_INTERNALS__`; it is absent in a plain browser.
function inTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!inTauri()) throw new Error(NOT_IN_TAURI);
  return invoke<T>(command, args);
}

export const pickFolder = () => call<string | null>('pick_folder');
export const scanTree = (root: string) => call<TreeNode>('scan_tree', { root });
export const readFile = (path: string) => call<string>('read_file', { path });
export const writeFile = (path: string, content: string) =>
  call<void>('write_file', { path, content });
export const startWatch = (root: string) => call<void>('start_watch', { root });

export interface MdEvent { kind: 'created' | 'changed' | 'deleted'; path: string }
export const onMdEvent = (cb: (e: MdEvent) => void) => {
  // No-op outside Tauri so the mount effect can't crash in a plain browser;
  // the missing runtime surfaces loudly on the first command (e.g. Import Folder).
  if (!inTauri()) return Promise.resolve(() => {});
  return listen<MdEvent>('md-event', (e) => cb(e.payload));
};
