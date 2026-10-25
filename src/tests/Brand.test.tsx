import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Brand from '../components/Brand';

describe('SEATS brand mark', () => {
  it('renders the same accessible vector mark in horizontal, stacked and icon-only variants', () => {
    const { rerender, container } = render(<Brand />);
    expect(screen.getByRole('link', { name: 'SEATS home' })).toHaveAttribute('href', '/');
    expect(container.querySelector('.brand-symbol')).toHaveAttribute('viewBox', '0 0 64 64');
    expect(container.querySelectorAll('.brand-symbol path')).toHaveLength(3);
    expect(screen.getByText('SEATS')).toBeInTheDocument();
    rerender(<Brand variant="stacked" tone="dark" tagline />);
    expect(container.querySelector('.brand-dark')).toBeInTheDocument();
    expect(screen.getByText('A more flexible way to fly.')).toBeInTheDocument();
    rerender(<Brand variant="icon" />);
    expect(container.querySelector('.brand-symbol')).toBeInTheDocument();
    expect(screen.queryByText('SEATS')).not.toBeInTheDocument();
  });
});
