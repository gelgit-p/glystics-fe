import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AiDraftsPage from './AiDraftsPage';

const drafts = vi.hoisted(() => [
  {
    id: 'd1', status: 'QUOTED', missingFields: [], confidence: 0.8,
    packageName: 'laptop', receiverName: 'Ada Lovelace', receiverAddress: '55 Herbert Macaulay Way, Yaba',
    receiverPhone: '0801', pickupDate: '2026-10-30', updatedAt: '2026-10-28T00:00:00Z', createdAt: '2026-10-28T00:00:00Z',
    quotes: [], conversation: { customerWaId: '234801' },
  },
]);

vi.mock('@/lib/ai-api', () => ({
  aiApi: {
    drafts: vi.fn(async () => drafts),
    overview: vi.fn(async () => ({ aiMode: 'demo', conversations: 1, pendingApprovals: 1, auditEvents: 1, draftsByStatus: {}, totalDrafts: 1 })),
  },
}));

describe('AI drafts mobile parity', () => {
  it('shows draft as navigable mobile card content (not only a wide table)', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <AiDraftsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(await screen.findAllByText('laptop')).not.toHaveLength(0);
    expect(screen.getAllByText('Ada Lovelace').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /laptop/i }).length).toBeGreaterThan(0);
  });
});
