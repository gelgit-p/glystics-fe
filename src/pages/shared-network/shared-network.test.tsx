import { describe, it, expect } from 'vitest';
import { naira } from '@/lib/shared-network-api';
describe('shared network helpers', () => {
  it('formats kobo as naira without mixing with existing credit balances', () => {
    expect(naira(150000)).toBe('₦1,500'); expect(naira(0)).toBe('₦0'); expect(naira(undefined)).toBe('₦0');
  });
});

import { paidPlans, type NetworkPlan } from '@/lib/shared-network-api';
describe('paidPlans', () => {
  const plan = (slug: string, monthlyPriceKobo: number, annualPriceKobo = monthlyPriceKobo * 10): NetworkPlan => ({ id: slug, name: slug, slug, monthlyPriceKobo, annualPriceKobo, monthlyDeliveryVolume: 1, reservedCapacityAllowance: 1, maxActiveSlots: 1, poolingEligible: true, discountPercent: 0, analyticsAccess: false, aiDispatchAccess: false, priorityAllocation: false, maxLocations: 1 });
  it('excludes Pay-as-you-go, Network Starter and any free plan', () => {
    expect(paidPlans([plan('network-starter', 500000), plan('network-growth', 1500000), plan('free', 0), plan('network-business', 5000000)]).map((p) => p.slug)).toEqual(['network-growth', 'network-business']);
    expect(paidPlans([])).toEqual([]);
  });
});
