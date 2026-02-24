import { render, screen } from '@testing-library/react';
import App from './App';

test('renders flash cards heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /flash cards/i })).toBeInTheDocument();
});
