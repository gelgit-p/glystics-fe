import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SNInfoPage from './InfoPage';

describe('/shared-network-info (public)', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it('renders for logged-out visitors with paid pricing even if the API fails (no login required)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('err', { status: 500 })));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={qc}><MemoryRouter><SNInfoPage /></MemoryRouter></QueryClientProvider>);
    expect(await screen.findByText('Your Business. Our Network. Smarter Deliveries.')).toBeInTheDocument();
    expect(screen.getByText('Network Growth')).toBeInTheDocument();
    expect(screen.getByText('Network Business')).toBeInTheDocument();
    expect(screen.queryByText(/Network Starter/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pay as you go/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Join the Network').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login');
  });
});
