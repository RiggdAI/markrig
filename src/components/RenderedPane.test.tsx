import { render, screen } from '@testing-library/react';
import { RenderedPane } from './RenderedPane';

test('renders a heading', () => {
  render(<RenderedPane content="# Title" />);
  expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
});

test('renders GFM task list items', () => {
  render(<RenderedPane content={'- [x] done\n- [ ] todo'} />);
  const boxes = screen.getAllByRole('checkbox');
  expect(boxes).toHaveLength(2);
  expect(boxes[0]).toBeChecked();
});

test('renders a GFM table', () => {
  render(<RenderedPane content={'| A | B |\n|---|---|\n| 1 | 2 |'} />);
  expect(screen.getByRole('table')).toBeInTheDocument();
});
