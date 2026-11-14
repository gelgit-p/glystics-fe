import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './LandingPage';
import { couriersApi } from '@/lib/couriers-api';

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a> }));
vi.mock('@/lib/couriers-api', () => ({ couriersApi: { list: vi.fn(), coverage: vi.fn() } }));

const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><LandingPage /></QueryClientProvider>);

describe('Landing page courier directory', () => {
  beforeEach(() => {
    vi.mocked(couriersApi.list).mockResolvedValue([
      { name: 'Redstar', serviceCode: 'red_star_courier', pinImage: null, originCountry: 'NG', international: false, domestic: true, express: false, operational: true, packageCategories: ['documents', 'accessories'] },
      { name: 'Kwik', serviceCode: 'kwik', pinImage: null, originCountry: 'NG', international: false, domestic: true, express: false, operational: false, packageCategories: [] },
    ]);
    vi.mocked(couriersApi.coverage).mockResolvedValue([
      { country: 'Nigeria', countryCode: 'NG', pickupStates: ['Lagos', 'Abuja'], deliveryStates: ['Lagos', 'Ogun'] },
    ]);
  });
  afterEach(() => vi.clearAllMocks());

  it('lists couriers from GET /public/couriers', async () => {
    renderPage();
    expect(await screen.findByText('Redstar')).toBeInTheDocument();
    expect(screen.getByText('Kwik')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByText(/Documents, Accessories/)).toBeInTheDocument();
  });

  it('opens coverage areas for a courier', async () => {
    renderPage();
    fireEvent.click((await screen.findAllByText('View coverage'))[0]);
    await waitFor(() => expect(couriersApi.coverage).toHaveBeenCalledWith('red_star_courier'));
    expect(await screen.findByText('Nigeria (NG)')).toBeInTheDocument();
    expect(screen.getByText(/Lagos, Abuja/)).toBeInTheDocument();
    expect(screen.getByText(/Lagos, Ogun/)).toBeInTheDocument();
  });
});
