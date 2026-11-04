import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminUsersPage from './users/AdminUsersPage';
import AdminBillingPage from './billing/AdminBillingPage';
import AdminDeliveriesPage from './deliveries/AdminDeliveriesPage';
import AdminNotificationsPage from './notifications/AdminNotificationsPage';
import AdminTemplatesPage from './templates/AdminTemplatesPage';
import AdminWhatsappPage from './whatsapp/AdminWhatsappPage';
import AdminUserDetailPage from './users/AdminUserDetailPage';
import { adminApi } from '@/lib/admin-api';

vi.mock('@/lib/admin-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin-api')>();
  return { ...actual, adminApi: { ...actual.adminApi, users: vi.fn(), billing: vi.fn(), deliveries: vi.fn(), notifications: vi.fn(), templates: vi.fn(), whatsapp: vi.fn(), user: vi.fn() } };
});

const paged = (items: unknown[]) => ({ items, total: items.length, page: 1, limit: 20 });

function renderPage(ui: React.ReactElement, path = '/admin/users') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('admin list pages display API data (regression: always-truthy JSX `empty`)', () => {
  it('AdminUsersPage renders user rows', async () => {
    vi.mocked(adminApi.users).mockResolvedValue(paged([{
      id: 'u1', email: 'ada@test.dev', businessName: 'Ada Stores', fullName: 'Ada', role: 'USER',
      emailConfirmed: true, aiDeliveryDetectionEnabled: false, facebookConnectStatus: true, webhookStatus: true,
      selectedPhoneNumberId: [], createdAt: '2026-01-01T00:00:00.000Z',
      creditWallet: { balance: 12, points: 3 },
      _count: { aiConversations: 1, deliveryDrafts: 2, automations: 0, messageTemplates: 1 },
    }]) as never);
    renderPage(<AdminUsersPage />);
    expect(await screen.findByText('ada@test.dev')).toBeInTheDocument();
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
  });

  it('AdminBillingPage renders purchase rows and totals', async () => {
    vi.mocked(adminApi.billing).mockResolvedValue({
      totals: { balance: 100, points: 5, transactions: 2, purchases: 1 },
      items: [{ id: 'p1', paymentReference: 'REF-1', amountKobo: 50000, credits: 10, status: 'PAID', createdAt: '2026-01-01T00:00:00.000Z', package: { name: 'Starter' }, wallet: { userId: 'u1', user: { email: 'ada@test.dev', businessName: 'Ada Stores' } } }],
      total: 1, page: 1, limit: 20,
    } as never);
    renderPage(<AdminBillingPage />, '/admin/billing');
    expect(await screen.findByText('REF-1')).toBeInTheDocument();
    expect(screen.queryByText('No transactions')).not.toBeInTheDocument();
  });

  it('AdminDeliveriesPage renders delivery rows', async () => {
    vi.mocked(adminApi.deliveries).mockResolvedValue(paged([{
      id: 'd1', trackingId: 'TRK-1', senderName: 'Sender', senderPhone: '1', senderAddress: 'A',
      receiverName: 'Receiver', receiverPhone: '2', receiverAddress: 'B', packageName: 'Box',
      courier_name: 'DHL', deliveryStatus: 'CREATED', paymentStatus: 'PAID', bookingStatus: 'BOOKED',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    }]) as never);
    renderPage(<AdminDeliveriesPage />, '/admin/deliveries');
    expect(await screen.findByText('TRK-1')).toBeInTheDocument();
    expect(screen.queryByText('No deliveries')).not.toBeInTheDocument();
  });

  it('AdminNotificationsPage renders notification rows', async () => {
    vi.mocked(adminApi.notifications).mockResolvedValue(paged([{
      id: 'n1', userId: 'u1', recipientPhone: '+2348000000000', templateName: 'order_confirmed', templateLanguage: 'en',
      status: 'sent', deliveryTrackingId: 'TRK-1', createdAt: '2026-01-01T00:00:00.000Z',
    }]) as never);
    renderPage(<AdminNotificationsPage />, '/admin/notifications');
    expect(await screen.findByText('+2348000000000')).toBeInTheDocument();
    expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
  });

  it('AdminTemplatesPage renders template rows', async () => {
    vi.mocked(adminApi.templates).mockResolvedValue(paged([{
      id: 't1', name: 'order_confirmed', language: 'en', status: 'APPROVED', category: 'UTILITY',
      user: { id: 'u1', email: 'ada@test.dev', businessName: 'Ada Stores', selectedWabaId: 'w1' },
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    }]) as never);
    renderPage(<AdminTemplatesPage />, '/admin/templates');
    expect(await screen.findByText('order_confirmed')).toBeInTheDocument();
    expect(screen.queryByText('No templates')).not.toBeInTheDocument();
  });

  it('AdminWhatsappPage renders connection rows', async () => {
    vi.mocked(adminApi.whatsapp).mockResolvedValue(paged([{
      id: 'u1', email: 'ada@test.dev', businessName: 'Ada Stores', facebookConnectStatus: true, webhookStatus: true,
      selectedWabaId: 'w1', selectedFacebookBusinessName: 'Ada FB', displayPhoneNumber: '+234 800',
      selectedPhoneNumberId: ['pn1'], selectedPhoneNumberQualityRating: 'GREEN',
    }]) as never);
    renderPage(<AdminWhatsappPage />, '/admin/whatsapp');
    expect(await screen.findByText('Ada Stores')).toBeInTheDocument();
    expect(screen.queryByText('No WhatsApp connections')).not.toBeInTheDocument();
  });

  it('AdminUserDetailPage renders user detail', async () => {
    vi.mocked(adminApi.user).mockResolvedValue({
      id: 'u1', email: 'ada@test.dev', businessName: 'Ada Stores', fullName: 'Ada', role: 'USER',
      emailConfirmed: true, aiDeliveryDetectionEnabled: true, facebookConnectStatus: true, selectedWabaId: 'w1',
      deliveries: 3, conversations: 2, drafts: 1,
      creditWallet: { balance: 10, points: 1, transactions: [], purchases: [] },
      automations: [], messageTemplates: [],
    } as never);
    renderPage(
      <Routes><Route path="/admin/users/:id" element={<AdminUserDetailPage />} /></Routes>,
      '/admin/users/u1',
    );
    expect(await screen.findByText('ada@test.dev')).toBeInTheDocument();
  });
});
