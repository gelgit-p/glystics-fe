import { describe, it, expect, beforeEach } from 'vitest';
import { canAccessLogisticsProvider } from '@/lib/logistics-provider-api';
import { LogisticsProviderRoute } from './route-guard';
import { REJECTED_LOCKED_ROUTES } from './LogisticsProviderLayout';

describe('Logistics Provider access (spec §1)', () => {
  beforeEach(() => localStorage.clear());
  it('only LOGISTICS_PROVIDER accounts can access the dashboard', () => {
    localStorage.setItem('userRole', 'LOGISTICS_PROVIDER');
    expect(canAccessLogisticsProvider()).toBe(true);
    localStorage.setItem('userRole', 'USER');
    expect(canAccessLogisticsProvider()).toBe(false);
    localStorage.setItem('userRole', 'SUPER_ADMIN');
    expect(canAccessLogisticsProvider()).toBe(false);
    localStorage.removeItem('userRole');
    expect(canAccessLogisticsProvider()).toBe(false);
  });
  it('route guard redirects non-providers to /dashboard and renders for providers', () => {
    expect(LogisticsProviderRoute({ status: 'USER' })).toBe('redirect:/dashboard');
    expect(LogisticsProviderRoute({ status: 'LOGISTICS_PROVIDER' })).toBe('render');
  });
  it('locks exactly the operational tabs when verification is REJECTED', () => {
    expect(REJECTED_LOCKED_ROUTES).toEqual([
      '/logistics-provider/capacity', '/logistics-provider/zones', '/logistics-provider/reservations',
      '/logistics-provider/shipments', '/logistics-provider/fleet', '/logistics-provider/earnings',
      '/logistics-provider/marketplace',
    ]);
    expect(REJECTED_LOCKED_ROUTES).not.toContain('/logistics-provider');
    expect(REJECTED_LOCKED_ROUTES).not.toContain('/logistics-provider/profile');
  });
});
