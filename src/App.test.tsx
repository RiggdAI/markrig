import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Prevent the real Tauri IPC from being called in jsdom.
vi.mock('./tauri', () => ({
  pickFolder: vi.fn(),
  scanTree: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  startWatch: vi.fn(),
  onMdEvent: vi.fn(async () => () => {}),
}));

// Prevent the Tauri store (plugin-store) from being called in jsdom.
vi.mock('./recents', () => ({
  getRecents: vi.fn(async () => []),
  addRecent: vi.fn(async () => {}),
}));

import App from './App';

test('renders the app shell', () => {
  render(<App />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});
