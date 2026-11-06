import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from '@/App';

vi.mock('@/lib/authenticated-fetch', () => ({
  authenticatedFetch: vi.fn(async () => ({
    ok: true,
    json: async () => ({ hasPurchasedCredits: true, fullName: 'Admin User', email: 'a@test.dev', businessName: 'Biz' }),
  })),
}));
vi.mock('@/lib/admin-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin-api')>();
  return {
    ...actual,
    adminApi: {
      ...actual.adminApi,
      overview: vi.fn(async () => ({
        users: { total: 1, superAdmins: 1, suspended: 0, detectionEnabled: 0 },
        deliveries: { total: 0, byStatus: {} },
        credits: { deliveryBalance: 0, points: 0, transactions: 0, purchasesByStatus: [] },
        ai: { mode: 'live', provider: 'p', model: 'm', globalEnabled: true, conversations: 0, drafts: 0, approvals: 0, failedMessages: 0, detectionEnabledTenants: 0 },
        notifications: { total: 0, failed: 0 },
        templates: { total: 0, pendingReview: 0 },
        automations: { total: 0, active: 0, totalRuns: 0 },
        whatsapp: { connectedTenants: 0, webhookEvents: 0, webhookFailed: 0 },
      })),
    },
  };
});
vi.mock('@/lib/ai-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ai-api')>();
  return { ...actual, aiApi: { ...actual.aiApi, adminAiHealth: vi.fn(async () => ({ ok: true, mode: 'live', provider: 'p', model: 'm' })) } };
});

describe('Admin routes render a single top bar', () => {
  it('/admin shows only the AdminLayout header, not the DashboardLayout one', async () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('userId', 'u1');
    localStorage.setItem('userRole', 'SUPER_ADMIN');
    window.history.pushState({}, '', '/admin');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Platform overview' })).toBeInTheDocument();
    // Exactly one header/topbar and one search box — previously both
    // DashboardLayout and AdminLayout rendered a Topbar.
    expect(document.querySelectorAll('header')).toHaveLength(1);
    expect(screen.getAllByPlaceholderText('Search deliveries, contacts...')).toHaveLength(1);
    expect(screen.queryByText('Dashboard', { selector: 'h1' })).not.toBeInTheDocument();
  });
});

describe('layout nesting contract', () => {
  it('Outlet-based layouts do not duplicate headers when correctly nested once', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/x']}>
          <Routes>
            <Route element={<Outlet />}>
              <Route path="/x" element={<p>content</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
