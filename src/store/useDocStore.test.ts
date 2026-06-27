import { beforeEach, expect, test } from 'vitest';
import { useDocStore, isDirty } from './useDocStore';

beforeEach(() => {
  useDocStore.setState(useDocStore.getInitialState(), true);
});

test('openFile sets disk and editor content equal (not dirty)', () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  const s = useDocStore.getState();
  expect(s.openPath).toBe('/p/a.md');
  expect(isDirty(s)).toBe(false);
});

test('editing makes it dirty', () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  useDocStore.getState().setEditorContent('# A edited');
  expect(isDirty(useDocStore.getState())).toBe(true);
});

test('disk change with no edits reloads silently, no conflict', () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  useDocStore.getState().onDiskChange('/p/a.md', '# A v2');
  const s = useDocStore.getState();
  expect(s.editorContent).toBe('# A v2');
  expect(s.conflict).toBe(false);
});

test('disk change with unsaved edits raises a conflict, keeps editor content', () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  useDocStore.getState().setEditorContent('# mine');
  useDocStore.getState().onDiskChange('/p/a.md', '# theirs');
  const s = useDocStore.getState();
  expect(s.conflict).toBe(true);
  expect(s.editorContent).toBe('# mine');
  expect(s.diskContent).toBe('# theirs');
});

test('resolveConflict reload takes disk content', () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  useDocStore.getState().setEditorContent('# mine');
  useDocStore.getState().onDiskChange('/p/a.md', '# theirs');
  useDocStore.getState().resolveConflict('reload');
  const s = useDocStore.getState();
  expect(s.editorContent).toBe('# theirs');
  expect(s.conflict).toBe(false);
  expect(isDirty(s)).toBe(false);
});

test('disk change to a non-open file is ignored', () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  useDocStore.getState().onDiskChange('/p/other.md', 'x');
  expect(useDocStore.getState().editorContent).toBe('# A');
});

test("resolveConflict('keep') clears the conflict but preserves the user's edits", () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  useDocStore.getState().setEditorContent('# mine');
  useDocStore.getState().onDiskChange('/p/a.md', '# theirs');
  useDocStore.getState().resolveConflict('keep');
  const s = useDocStore.getState();
  expect(s.conflict).toBe(false);
  expect(s.editorContent).toBe('# mine');
  expect(s.diskContent).toBe('# theirs');
  expect(isDirty(s)).toBe(true);
});

test('markSaved makes the document clean by syncing disk to editor', () => {
  useDocStore.getState().openFile('/p/a.md', '# A');
  useDocStore.getState().setEditorContent('# edited');
  expect(isDirty(useDocStore.getState())).toBe(true);
  useDocStore.getState().markSaved();
  const s = useDocStore.getState();
  expect(s.diskContent).toBe('# edited');
  expect(isDirty(s)).toBe(false);
});
