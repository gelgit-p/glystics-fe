import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileBottomNav } from '../Sidebar';

vi.mock('@/lib/authenticated-fetch', () => ({
  authenticatedFetch: vi.fn(async () => ({
    ok: true,
    json: async () => ({ hasPurchasedCredits: false }),
  })),
}));

function renderNav(path = '/dashboard') {
  localStorage.setItem('userId', 'u1');
  localStorage.setItem('accessToken', 'token');
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <MobileBottomNav onMore={() => undefined} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MobileBottomNav', () => {
  beforeEach(() => localStorage.clear());

  it('renders Home, Deliveries, Automation, Credits and More tabs', async () => {
    renderNav();
    for (const label of ['Home', 'Deliveries', 'Automation', 'Credits', 'More']) {
      expect(await screen.findByText(label)).toBeInTheDocument();
    }
  });

  it('marks the active route', async () => {
    renderNav('/deliveries');
    const deliveries = await screen.findByRole('button', { name: /Deliveries/ });
    expect(deliveries).toHaveAttribute('aria-current', 'page');
  });
});
