import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';

export type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- loose API payloads, narrowed at call sites
const base = () => import.meta.env.VITE_API_URL as string;
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  const body = await res.json().catch(() => null) as AnyRecord;
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`);
  return body as T;
}
const post = <T,>(path: string, data?: unknown) => req<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) });
const patch = <T,>(path: string, data?: unknown) => req<T>(path, { method: 'PATCH', body: data === undefined ? undefined : JSON.stringify(data) });
const del = <T,>(path: string) => req<T>(path, { method: 'DELETE' });

export interface NetworkPlan { id: string; name: string; slug: string; description?: string | null; monthlyPriceKobo: number; annualPriceKobo: number; monthlyDeliveryVolume: number; reservedCapacityAllowance: number; maxActiveSlots: number; poolingEligible: boolean; discountPercent: number; analyticsAccess: boolean; aiDispatchAccess: boolean; priorityAllocation: boolean; maxLocations: number }
export interface NetworkBusiness { id: string; businessName: string; businessEmail: string; contactPhone: string; category: string; pickupLocations: string[]; operatingRegions: string[]; expectedDailyVolume: number; expectedWeeklyVolume: number; preferredWindows: string[]; status: string; aiAutoDispatchEnabled: boolean; aiAutoReserveEnabled: boolean; aiSpendLimitCredits?: number | null; wallet?: { balance: number; lifetimePurchased: number; lifetimeSpent: number } | null; subscriptions?: AnyRecord[] }
export interface Capacity { id: string; date: string; region: string; window: string; vehicleType: string; totalCapacity: number; reservedCapacity: number; available: number; pricePerSlotCredits: number; pricePerSlotKobo: number; cutoffAt?: string | null }
export interface Reservation { id: string; quantity: number; pickupLocation: string; deliveryType: string; status: string; costCredits: number; costKobo: number; createdAt: string; capacity: Capacity }
export interface Slot { id: string; title: string; date: string; window: string; startTime?: string | null; endTime?: string | null; quantity: number; pickupLocation: string; isRecurring: boolean; recurrence?: string | null; status: string; reservationId?: string | null }
export interface PoolDelivery { id: string; quantity: number; pickupAddress: string; destinationRegion: string; estimatedCostKobo: number; estimatedSavingsKobo: number; deliveryId?: string | null; status: string }
export interface Pool { id: string; name: string; region: string; date: string; window: string; status: string; courierName?: string | null; vehicleType: string; maxDeliveries: number; totalDeliveries: number; estimatedSavingsKobo: number; businessCount: number; remaining: number; myDeliveries: PoolDelivery[]; score?: number; reason?: string }

export const sharedNetworkApi = {
  plans: () => req<NetworkPlan[]>('/shared-network/plans'),
  business: () => req<NetworkBusiness | null>('/shared-network/business'),
  createBusiness: (d: unknown) => post<AnyRecord>('/shared-network/business', d),
  updateBusiness: (d: unknown) => patch<NetworkBusiness>('/shared-network/business', d),
  createSubscription: (d: unknown) => post<AnyRecord>('/shared-network/subscriptions', d),
  verifySubscription: (paymentReference: string) => post<AnyRecord>('/shared-network/subscriptions/verify', { paymentReference }),
  currentSubscription: () => req<AnyRecord>('/shared-network/subscriptions/current'),
  cancelSubscription: () => patch<AnyRecord>('/shared-network/subscriptions/cancel'),
  availableCapacity: (region: string, window?: string, date?: string) => req<Capacity[]>(`/shared-network/capacity/available?region=${encodeURIComponent(region)}${window ? `&window=${window}` : ''}${date ? `&date=${date}` : ''}`),
  reservations: () => req<Reservation[]>('/shared-network/capacity/reservations'),
  createReservation: (d: unknown) => post<Reservation>('/shared-network/capacity/reservations', d),
  updateReservation: (id: string, quantity: number) => patch<Reservation>(`/shared-network/capacity/reservations/${id}`, { quantity }),
  cancelReservation: (id: string) => del<AnyRecord>(`/shared-network/capacity/reservations/${id}`),
  slots: () => req<Slot[]>('/shared-network/slots'),
  createSlot: (d: unknown) => post<Slot>('/shared-network/slots', d),
  bookSlot: (id: string, d?: unknown) => post<Slot>(`/shared-network/slots/${id}/book`, d ?? {}),
  unbookSlot: (id: string) => del<Slot>(`/shared-network/slots/${id}/book`),
  deleteSlot: (id: string) => del<AnyRecord>(`/shared-network/slots/${id}`),
  pools: (region?: string) => req<Pool[]>(`/shared-network/pools${region ? `?region=${encodeURIComponent(region)}` : ''}`),
  createPool: (d: unknown) => post<Pool>('/shared-network/pools', d),
  joinPool: (id: string, d: unknown) => post<AnyRecord>(`/shared-network/pools/${id}/join`, d),
  leavePool: (id: string) => post<AnyRecord>(`/shared-network/pools/${id}/leave`),
  deliveries: () => req<AnyRecord[]>('/shared-network/deliveries'),
  billing: () => req<AnyRecord>('/shared-network/billing/overview'),
  transactions: () => req<AnyRecord[]>('/shared-network/billing/transactions'),
  credits: () => req<AnyRecord>('/shared-network/credits'),
  purchaseCredits: (credits: number) => post<AnyRecord>('/shared-network/credits/purchase', { credits, idempotencyKey: `web-${Date.now()}` }),
  verifyCredits: (paymentReference: string) => post<AnyRecord>('/shared-network/credits/verify', { paymentReference }),
  invoices: () => req<AnyRecord[]>('/shared-network/invoices'),
  analytics: () => req<AnyRecord>('/shared-network/analytics/overview'),
  recommend: (d: unknown) => post<AnyRecord>('/shared-network/ai/recommend', d),
};
export const sharedNetworkAdminApi = {
  overview: () => req<AnyRecord>('/admin/shared-network/overview'),
  businesses: () => req<AnyRecord[]>('/admin/shared-network/businesses'),
  setBusinessStatus: (id: string, status: string) => patch<AnyRecord>(`/admin/shared-network/businesses/${id}/status`, { status }),
  plans: () => req<NetworkPlan[]>('/admin/shared-network/plans'),
  upsertPlan: (d: unknown, id?: string) => id ? patch<AnyRecord>(`/admin/shared-network/plans/${id}`, d) : post<AnyRecord>('/admin/shared-network/plans', d),
  adjustCredits: (d: unknown) => post<AnyRecord>('/admin/shared-network/credits/adjust', d),
  upsertCapacity: (d: unknown) => post<AnyRecord>('/admin/shared-network/capacity', d),
  pools: () => req<AnyRecord[]>('/admin/shared-network/pools'),
  transactions: () => req<AnyRecord[]>('/admin/shared-network/transactions'),
  audit: () => req<AnyRecord[]>('/admin/shared-network/audit'),
  refundReservation: (id: string) => post<AnyRecord>(`/admin/shared-network/reservations/${id}/refund`),
};
export const naira = (kobo?: number | null) => `₦${((kobo ?? 0) / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
export const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

