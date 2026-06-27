import { render, screen, fireEvent } from '@testing-library/react';
import { FolderTree } from './FolderTree';
import type { TreeNode } from '../types';

const tree: TreeNode = {
  name: 'root', path: '/r', is_dir: true,
  children: [
    { name: 'README.md', path: '/r/README.md', is_dir: false, children: [] },
    { name: 'docs', path: '/r/docs', is_dir: true, children: [
      { name: 'plan.md', path: '/r/docs/plan.md', is_dir: false, children: [] },
    ]},
  ],
};

test('renders nested files and fires onSelect with the path', () => {
  const onSelect = vi.fn();
  render(<FolderTree tree={tree} openPath={null} onSelect={onSelect} />);
  fireEvent.click(screen.getByText('plan.md'));
  expect(onSelect).toHaveBeenCalledWith('/r/docs/plan.md');
});

test('renders empty state when tree is null', () => {
  render(<FolderTree tree={null} openPath={null} onSelect={() => {}} />);
  expect(screen.getByText(/no folder/i)).toBeInTheDocument();
});
