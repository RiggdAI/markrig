import { create } from 'zustand';
import type { TreeNode, ViewMode } from '../types';

interface DocState {
  root: string | null;
  tree: TreeNode | null;
  openPath: string | null;
  diskContent: string;
  editorContent: string;
  viewMode: ViewMode;
  conflict: boolean;
  error: string | null;
  setRoot: (root: string) => void;
  setTree: (tree: TreeNode) => void;
  openFile: (path: string, content: string) => void;
  setEditorContent: (content: string) => void;
  markSaved: () => void;
  onDiskChange: (path: string, content: string) => void;
  resolveConflict: (choice: 'reload' | 'keep') => void;
  setViewMode: (mode: ViewMode) => void;
  setError: (error: string | null) => void;
}

export const isDirty = (s: Pick<DocState, 'diskContent' | 'editorContent'>): boolean =>
  s.diskContent !== s.editorContent;

export const useDocStore = create<DocState>((set, get) => ({
  root: null,
  tree: null,
  openPath: null,
  diskContent: '',
  editorContent: '',
  viewMode: 'rendered',
  conflict: false,
  error: null,
  setRoot: (root) => set({ root }),
  setTree: (tree) => set({ tree }),
  openFile: (path, content) =>
    set({ openPath: path, diskContent: content, editorContent: content, conflict: false }),
  setEditorContent: (content) => set({ editorContent: content }),
  markSaved: () => set({ diskContent: get().editorContent }),
  onDiskChange: (path, content) => {
    const s = get();
    if (path !== s.openPath) return;
    if (isDirty(s)) {
      set({ diskContent: content, conflict: true });
    } else {
      set({ diskContent: content, editorContent: content });
    }
  },
  resolveConflict: (choice) => {
    if (choice === 'reload') {
      set({ editorContent: get().diskContent, conflict: false });
    } else {
      set({ conflict: false });
    }
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  setError: (error) => set({ error }),
}));
