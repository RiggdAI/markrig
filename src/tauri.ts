import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { TreeNode } from './types';

export const pickFolder = () => invoke<string | null>('pick_folder');
export const scanTree = (root: string) => invoke<TreeNode>('scan_tree', { root });
export const readFile = (path: string) => invoke<string>('read_file', { path });
export const writeFile = (path: string, content: string) =>
  invoke<void>('write_file', { path, content });
export const startWatch = (root: string) => invoke<void>('start_watch', { root });

export interface MdEvent { kind: 'created' | 'changed' | 'deleted'; path: string }
export const onMdEvent = (cb: (e: MdEvent) => void) =>
  listen<MdEvent>('md-event', (e) => cb(e.payload));
