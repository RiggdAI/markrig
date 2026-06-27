import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

const tree = {
  name: 'root', path: '/r', is_dir: true,
  children: [{ name: 'plan.md', path: '/r/plan.md', is_dir: false, children: [] }],
};

vi.mock('./tauri', () => ({
  pickFolder: vi.fn(async () => '/r'),
  scanTree: vi.fn(async () => tree),
  readFile: vi.fn(async () => '# Plan'),
  writeFile: vi.fn(async () => {}),
  startWatch: vi.fn(async () => {}),
  onMdEvent: vi.fn(async () => () => {}),
}));

// Prevent the Tauri store (plugin-store) from being called in jsdom.
vi.mock('./recents', () => ({
  getRecents: vi.fn(async () => []),
  addRecent: vi.fn(async () => {}),
}));

import App from './App';
import { useDocStore } from './store/useDocStore';

beforeEach(() => {
  useDocStore.setState(useDocStore.getInitialState(), true);
});

test('import folder, open file, see rendered content, toggle to source', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /import folder/i }));
  await waitFor(() => screen.getByText('plan.md'));
  fireEvent.click(screen.getByText('plan.md'));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument(),
  );
  fireEvent.click(screen.getByRole('button', { name: /source/i }));
  // CodeMirror splits syntax tokens into separate spans, so match against the
  // textbox container which has the full text content accessible via textContent.
  await waitFor(() =>
    expect(screen.getByRole('textbox').textContent).toContain('# Plan'),
  );
});
