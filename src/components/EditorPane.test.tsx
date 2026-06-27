import { render, screen } from '@testing-library/react';
import { EditorPane } from './EditorPane';

test('shows the current value', () => {
  render(<EditorPane value="# Hello editor" onChange={() => {}} />);
  expect(screen.getByText(/Hello editor/)).toBeInTheDocument();
});
