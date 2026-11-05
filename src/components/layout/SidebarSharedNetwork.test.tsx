import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { sharedNetworkApi } from '@/lib/shared-network-api';

vi.mock('@/lib/shared-network-api', async (orig) => {
  const actual = await orig<typeof import('@/lib/shared-network-api')>();
  return { ...actual, sharedNetworkApi: { status: vi.fn(), business: vi.fn() } };
});
vi.mock('@/lib/authenticated-fetch', () => ({ authenticatedFetch: vi.fn(async () => new Response(JSON.stringify({ hasPurchasedCredits: true }), { status: 200 })) }));

function renderSidebar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><MemoryRouter><Sidebar collapsed={false} setCollapsed={() => undefined} /></MemoryRouter></QueryClientProvider>);
}

describe('Sidebar Shared Network button', () => {
  beforeEach(() => { localStorage.setItem('accessToken', 't'); vi.clearAllMocks(); });
  it('is a disabled button (not a link) when admin turned the network OFF', async () => {
    vi.mocked(sharedNetworkApi.status).mockResolvedValue({ networkEnabled: false, disabledMessage: 'Off for maintenance' });
    vi.mocked(sharedNetworkApi.business).mockResolvedValue(null);
    renderSidebar();
    const btn = await screen.findByRole('button', { name: /Shared Network/i });
    expect(btn).toBeDisabled();
    // Disabled state + explanation moved to the Radix tooltip (Hint); native title was removed so it cannot double-show.
    expect(btn).not.toHaveAttribute('title');
    expect(screen.queryByRole('link', { name: /Shared Network/i })).not.toBeInTheDocument();
  });
  it('is a link when the network is ON', async () => {
    vi.mocked(sharedNetworkApi.status).mockResolvedValue({ networkEnabled: true });
    vi.mocked(sharedNetworkApi.business).mockResolvedValue(null);
    renderSidebar();
    expect(await screen.findByRole('link', { name: /Shared Network/i })).toBeInTheDocument();
  });
  it('is disabled when this business was deactivated by admin', async () => {
    vi.mocked(sharedNetworkApi.status).mockResolvedValue({ networkEnabled: true });
    vi.mocked(sharedNetworkApi.business).mockResolvedValue({ accessEnabled: false } as never);
    renderSidebar();
    expect(await screen.findByRole('button', { name: /Shared Network/i })).toBeDisabled();
  });
});
