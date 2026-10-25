import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ProductPages, { HomeProductPanel } from '../pages/ProductPages';

describe('multi-page demo journey', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/search?origin=DEL&destination=IDR&departure=2027-04-03&passengers=2');
  });

  it('reads search details from the URL and carries a selected schedule to plans', () => {
    render(<ProductPages path="/search" />);
    expect(screen.getByLabelText('From')).toHaveValue('DEL');
    expect(screen.getByLabelText('To')).toHaveValue('IDR');
    expect(screen.getByLabelText('Passengers')).toHaveValue('2');
    expect(screen.getByText(/Demo data — not live airline availability/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Review plans/ })[0]).toHaveAttribute('href', expect.stringContaining('/plans?'));
    expect(screen.getAllByRole('link', { name: /Review plans/ })[0]).toHaveAttribute('href', expect.stringContaining('origin=DEL'));
  });

  it('reports invalid identical airports and offers an accessible route reversal', () => {
    window.history.replaceState({}, '', '/search?origin=IDR&destination=DEL');
    render(<ProductPages path="/search" />);
    fireEvent.click(screen.getByRole('button', { name: 'Swap origin and destination' }));
    expect(screen.getByLabelText('From')).toHaveValue('DEL');
    expect(screen.getByLabelText('To')).toHaveValue('IDR');
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'DEL' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update search' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Choose two different airports/);
  });

  it('uses route-specific demo schedules and refuses unsupported city pairs', () => {
    window.history.replaceState({}, '', '/search?origin=IDR&destination=BOM');
    const { unmount } = render(<ProductPages path="/search" />);
    expect(screen.getByText(/Indore to Mumbai/)).toBeInTheDocument();
    expect(screen.getAllByText('DEMO SCHEDULE')).toHaveLength(2);
    unmount();

    window.history.replaceState({}, '', '/search?origin=BOM&destination=DEL');
    render(<ProductPages path="/search" />);
    expect(screen.getByRole('alert')).toHaveTextContent(/don’t have illustrative schedules/i);
    expect(screen.queryByText('DEMO SCHEDULE')).not.toBeInTheDocument();
  });

  it('keeps unknown airport codes visible and reports the unsupported route safely', () => {
    window.history.replaceState({}, '', '/search?origin=XYZ&destination=DEL');
    render(<ProductPages path="/search" />);
    expect(screen.getByLabelText('From')).toHaveValue('XYZ');
    expect(screen.getByRole('alert')).toHaveTextContent('XYZ');
    expect(screen.queryByText('DEMO SCHEDULE')).not.toBeInTheDocument();
  });

  it('lets keyboard-accessible destination choices update the hero route summary', () => {
    const { container } = render(<HomeProductPanel />);
    const mumbai = screen.getByRole('button', { name: /Mumbai \(BOM\)/ });
    fireEvent.click(mumbai);
    expect(mumbai).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('.hero-route-destination strong')).toHaveTextContent('Mumbai');
    fireEvent.click(screen.getByRole('button', { name: 'Swap origin and destination' }));
    expect(container.querySelector('.hero-route-endpoint strong')).toHaveTextContent('Mumbai');
  });

  it('persists a plan selection and keeps the standby action explicitly demo-only', () => {
    window.history.replaceState({}, '', '/membership?plan=plus&origin=IDR&destination=DEL&passengers=2');
    const { rerender } = render(<ProductPages path="/membership" />);
    expect(screen.getByText('Flex Plus')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('seats.demo.membership.v1') ?? '{}')).toMatchObject({ plan: 'plus', origin: 'IDR', destination: 'DEL', passengers: 2 });
    rerender(<ProductPages path="/standby" />);
    fireEvent.click(screen.getByRole('button', { name: /Create local demo request/ }));
    expect(screen.getByText(/Demo request recorded in this browser/)).toBeInTheDocument();
    expect(screen.getByText(/No booking or ticket/)).toBeInTheDocument();
  });

  it('validates support form input and reports local-only feedback', () => {
    window.history.replaceState({}, '', '/contact');
    render(<ProductPages path="/contact" />);
    fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'traveler@example.com' } });
    fireEvent.change(screen.getByLabelText('How can we help?'), { target: { value: 'Please tell me about the demo.' } });
    fireEvent.click(screen.getByRole('button', { name: /Preview demo submission/ }));
    expect(screen.getByRole('status')).toHaveTextContent(/No email was sent/);
  });
});
