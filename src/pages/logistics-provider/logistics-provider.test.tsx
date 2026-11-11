import { describe, it, expect, beforeEach } from 'vitest';
import { canAccessLogisticsProvider } from '@/lib/logistics-provider-api';
import { LogisticsProviderRoute } from './route-guard';

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
});
