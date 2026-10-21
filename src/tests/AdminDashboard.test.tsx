import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboard from '../pages/AdminDashboard';

const { loadAdminOverview } = vi.hoisted(() => ({ loadAdminOverview: vi.fn() }));

vi.mock('../services/dashboard', () => ({ loadAdminOverview }));
vi.mock('../features/auth/authContext', () => ({
  useAuth: () => ({
    configured: false,
    configurationMessage: 'Supabase is not configured.',
    session: null,
    loadingSession: false,
    submitting: false,
    error: null,
    notice: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    clearFeedback: vi.fn(),
  }),
}));

describe('Admin dashboard access', () => {
  beforeEach(() => loadAdminOverview.mockClear());

  it('fails closed without Supabase authorization and does not load operational data', async () => {
    render(<AdminDashboard />);

    expect(await screen.findByText('Operations data is unavailable')).toBeInTheDocument();
    expect(screen.getByText(/database authorization cannot be checked/i)).toBeInTheDocument();
    expect(screen.getByText(/no request or inventory data has been loaded/i)).toBeInTheDocument();
    expect(loadAdminOverview).not.toHaveBeenCalled();
  });
});
