import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import type { MdEvent } from './tauri';

const tree = {
  name: 'root', path: '/r', is_dir: true,
  children: [{ name: 'plan.md', path: '/r/plan.md', is_dir: false, children: [] }],
};

// Captured md-event callback — tests invoke this to simulate Tauri events.
let capturedMdCallback: ((e: MdEvent) => void) | null = null;

vi.mock('./tauri', () => ({
  pickFolder: vi.fn(async () => '/r'),
  scanTree: vi.fn(async () => tree),
  readFile: vi.fn(async () => '# Plan'),
  writeFile: vi.fn(async () => {}),
  startWatch: vi.fn(async () => {}),
  onMdEvent: vi.fn((cb: (e: MdEvent) => void) => {
    capturedMdCallback = cb;
    return Promise.resolve(() => {});
  }),
}));

vi.mock('./recents', () => ({
  getRecents: vi.fn(async () => []),
  addRecent: vi.fn(async () => {}),
}));

import App from './App';
import { useDocStore } from './store/useDocStore';
import { readFile } from './tauri';

const mockedReadFile = readFile as ReturnType<typeof vi.fn>;

beforeEach(() => {
  useDocStore.setState(useDocStore.getInitialState(), true);
  capturedMdCallback = null;
  mockedReadFile.mockResolvedValue('# Plan');
});

test('scenario A: silent reload when file changes and no edits', async () => {
  render(<App />);

  // Import folder and open file
  fireEvent.click(screen.getByRole('button', { name: /import folder/i }));
  await waitFor(() => screen.getByText('plan.md'));
  fireEvent.click(screen.getByText('plan.md'));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument(),
  );

  // Simulate disk change with new content (no user edits, so not dirty)
  mockedReadFile.mockResolvedValue('# Updated Plan');
  await waitFor(() => expect(capturedMdCallback).not.toBeNull());
  capturedMdCallback!({ kind: 'changed', path: '/r/plan.md' });

  // Content updates and NO conflict banner
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Updated Plan' })).toBeInTheDocument(),
  );
  expect(screen.queryByText(/this file changed on disk/i)).not.toBeInTheDocument();
});

test('scenario B: conflict banner when file changes while editor is dirty', async () => {
  render(<App />);

  // Import folder and open file
  fireEvent.click(screen.getByRole('button', { name: /import folder/i }));
  await waitFor(() => screen.getByText('plan.md'));
  fireEvent.click(screen.getByText('plan.md'));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument(),
  );

  // Make the file dirty by editing editor content via store
  const userEditedContent = '# My edits';
  useDocStore.getState().setEditorContent(userEditedContent);

  // Simulate disk change with new content
  const newDiskContent = '# Updated Plan';
  mockedReadFile.mockResolvedValue(newDiskContent);
  await waitFor(() => expect(capturedMdCallback).not.toBeNull());
  capturedMdCallback!({ kind: 'changed', path: '/r/plan.md' });

  // Conflict banner appears and user's edits are preserved
  await waitFor(() =>
    expect(screen.getByText(/this file changed on disk/i)).toBeInTheDocument(),
  );
  // Verify that store correctly handled onDiskChange in dirty state:
  // editorContent is still the user's edits, diskContent has the new disk version
  await waitFor(() => {
    expect(useDocStore.getState().editorContent).toBe(userEditedContent);
    expect(useDocStore.getState().diskContent).toBe(newDiskContent);
  });
});

test('scenario C: deleted open file shows error notice', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /import folder/i }));
  await waitFor(() => screen.getByText('plan.md'));
  fireEvent.click(screen.getByText('plan.md'));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument(),
  );

  await waitFor(() => expect(capturedMdCallback).not.toBeNull());
  capturedMdCallback!({ kind: 'deleted', path: '/r/plan.md' });

  await waitFor(() =>
    expect(screen.getByText(/no longer exists on disk/i)).toBeInTheDocument(),
  );
});
