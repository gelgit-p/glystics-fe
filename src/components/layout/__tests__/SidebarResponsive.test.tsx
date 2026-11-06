import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../Sidebar';

vi.mock('@/lib/authenticated-fetch', () => ({
  authenticatedFetch: vi.fn(async () => ({ ok: true, json: async () => ({ hasPurchasedCredits: true }) })),
}));

describe('Desktop sidebar responsive visibility', () => {
  it('is hidden on mobile and only displayed at lg (prevents overlaying content)', () => {
    localStorage.setItem('userId', 'u1');
    localStorage.setItem('accessToken', 'token');
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/billing']}>
          <Sidebar collapsed={false} setCollapsed={() => undefined} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const aside = screen.getByLabelText('Desktop navigation');
    expect(aside.className).toContain('hidden');
    expect(aside.className).toContain('lg:flex');
    expect(aside.className).not.toMatch(/(^|\s)flex(\s|$)/);
  });
});
