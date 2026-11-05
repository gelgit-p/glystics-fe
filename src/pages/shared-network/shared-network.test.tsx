import { describe, it, expect } from 'vitest';
import { naira } from '@/lib/shared-network-api';
describe('shared network helpers', () => {
  it('formats kobo as naira without mixing with existing credit balances', () => {
    expect(naira(150000)).toBe('₦1,500'); expect(naira(0)).toBe('₦0'); expect(naira(undefined)).toBe('₦0');
  });
});
