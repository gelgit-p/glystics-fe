import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import DeliveriesPage from './DeliveriesPage';

vi.mock('@/lib/authenticated-fetch', () => ({
  authenticatedFetch: vi.fn(async (url: string) => {
    if (String(url).includes('/delivery/')) {
      return {
        ok: true,
        json: async () => [
          {
            id: 'd1', trackingId: 'TRK-NULL-1', receiverName: 'Receiver One', receiverPhone: '+2348000000000',
            senderAddress: 'Lagos', receiverAddress: 'Abuja', deliveryStatus: null,
            checkoutUrl: null, createdAt: '2026-01-01T00:00:00.000Z', courier_name: null,
          },
          {
            id: 'd2', trackingId: 'TRK-OK-2', receiverName: 'Receiver Two', receiverPhone: '+2348000000001',
            senderAddress: 'Lagos', receiverAddress: 'Kano', deliveryStatus: 'DELIVERED',
            checkoutUrl: null, createdAt: '2026-01-02T00:00:00.000Z', courier_name: 'DHL',
          },
        ],
      };
    }
    return { ok: true, json: async () => ({ status: 'success', message: 'ok', data: [] }) };
  }),
}));

describe('DeliveriesPage with nullable deliveryStatus', () => {
  it('renders rows instead of erroring/filtering everything when a delivery has null status', async () => {
    localStorage.setItem('userId', 'u1');
    localStorage.setItem('accessToken', 'token');
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/deliveries']}>
          <DeliveriesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect((await screen.findAllByText('TRK-NULL-1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('TRK-OK-2')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Invalid delivery record received from the server.')).not.toBeInTheDocument();
  });
});
