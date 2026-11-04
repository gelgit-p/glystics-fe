import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminOverviewPage from './AdminOverviewPage';
import { adminApi, type PlatformOverview } from '@/lib/admin-api';
import { aiApi } from '@/lib/ai-api';

vi.mock('@/lib/admin-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin-api')>();
  return { ...actual, adminApi: { ...actual.adminApi, overview: vi.fn() } };
});
vi.mock('@/lib/ai-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ai-api')>();
  return { ...actual, aiApi: { ...actual.aiApi, adminAiHealth: vi.fn() } };
});

const overview = (credits: PlatformOverview['credits']): PlatformOverview => ({
  users: { total: 3, superAdmins: 1, suspended: 0, detectionEnabled: 2 },
  deliveries: { total: 5, byStatus: { Created: 2, Delivered: 3 } },
  credits,
  ai: { mode: 'live', provider: 'baseten', model: 'm', globalEnabled: true, conversations: 4, drafts: 1, approvals: 2, failedMessages: 0, detectionEnabledTenants: 2 },
  notifications: { total: 6, failed: 1 },
  templates: { total: 2, pendingReview: 0 },
  automations: { total: 1, active: 1, totalRuns: 9 },
  whatsapp: { connectedTenants: 2, webhookEvents: 11, webhookFailed: 0 },
});

function renderPage(credits: PlatformOverview['credits']) {
  vi.mocked(adminApi.overview).mockResolvedValue(overview(credits));
  vi.mocked(aiApi.adminAiHealth).mockResolvedValue({ ok: true, mode: 'live', provider: 'baseten', model: 'm' });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminOverviewPage />
    </QueryClientProvider>,
  );
}

describe('AdminOverviewPage', () => {
  it('renders with purchasesByStatus from the current API', async () => {
    renderPage({
      deliveryBalance: 100, points: 0, transactions: 7,
      purchasesByStatus: [{ status: 'PAID', count: 3, amountKobo: 500 }, { status: 'PENDING', count: 2, amountKobo: 200 }],
    });
    expect(await screen.findByText('Platform overview')).toBeInTheDocument();
    expect(screen.getByText(/7 transactions · 5 purchases/)).toBeInTheDocument();
  });

  it('does not crash when purchases fields are missing (regression: undefined.reduce)', async () => {
    renderPage({ deliveryBalance: 0, points: 0, transactions: 0 } as PlatformOverview['credits']);
    expect(await screen.findByText('Platform overview')).toBeInTheDocument();
    expect(screen.getByText(/0 transactions · 0 purchases/)).toBeInTheDocument();
  });
});
