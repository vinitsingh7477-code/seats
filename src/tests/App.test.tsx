import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('SEATS demo experience', () => {
  it('labels illustrative flights as demo and clearly states that no booking is created', () => {
    render(<App />);

    expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
    expect(screen.getByText(/no booking or ticket is created/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sample schedule/)).toHaveLength(3);
    expect(screen.getByText(/Demo browsing is ready/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Availability not connected/)).not.toHaveLength(0);
    expect(screen.queryByText(/₹|\$\d|\d,\d{3}/)).not.toBeInTheDocument();
  });
});
