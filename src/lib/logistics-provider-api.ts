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

/** Spec name for the account field; in this codebase it is stored as the user role. */
export const canAccessLogisticsProvider = () => localStorage.getItem('userRole') === 'LOGISTICS_PROVIDER';

export const logisticsProviderApi = {
  overview: () => req<AnyRecord>('/logistics-provider/overview'),
  profile: () => req<AnyRecord | null>('/logistics-provider/profile'),
  saveProfile: (d: unknown) => post<AnyRecord>('/logistics-provider/profile', d),
  addDocument: (d: unknown) => post<AnyRecord>('/logistics-provider/profile/documents', d),
  zones: () => req<AnyRecord[]>('/logistics-provider/zones'),
  createZone: (d: unknown) => post<AnyRecord>('/logistics-provider/zones', d),
  updateZone: (id: string, d: unknown) => patch<AnyRecord>(`/logistics-provider/zones/${id}`, d),
  deleteZone: (id: string) => del<AnyRecord>(`/logistics-provider/zones/${id}`),
  capacity: () => req<AnyRecord[]>('/logistics-provider/capacity'),
  createCapacity: (d: unknown) => post<AnyRecord>('/logistics-provider/capacity', d),
  updateCapacity: (id: string, d: unknown) => patch<AnyRecord>(`/logistics-provider/capacity/${id}`, d),
  capacityAction: (id: string, action: string) => post<AnyRecord>(`/logistics-provider/capacity/${id}/action`, { action }),
  duplicateCapacity: (id: string) => post<AnyRecord>(`/logistics-provider/capacity/${id}/duplicate`),
  reservations: () => req<AnyRecord[]>('/logistics-provider/reservations'),
  reservation: (id: string) => req<AnyRecord>(`/logistics-provider/reservations/${id}`),
  reservationAction: (id: string, d: unknown) => post<AnyRecord>(`/logistics-provider/reservations/${id}/action`, d),
  markPaid: (id: string) => post<AnyRecord>(`/logistics-provider/reservations/${id}/mark-paid`),
  shipments: () => req<AnyRecord[]>('/logistics-provider/shipments'),
  createShipment: (d: unknown) => post<AnyRecord>('/logistics-provider/shipments', d),
  updateShipment: (id: string, d: unknown) => patch<AnyRecord>(`/logistics-provider/shipments/${id}`, d),
  fleet: () => req<{ riders: AnyRecord[]; vehicles: AnyRecord[] }>('/logistics-provider/fleet'),
  createRider: (d: unknown) => post<AnyRecord>('/logistics-provider/fleet/riders', d),
  updateRider: (id: string, d: unknown) => patch<AnyRecord>(`/logistics-provider/fleet/riders/${id}`, d),
  createVehicle: (d: unknown) => post<AnyRecord>('/logistics-provider/fleet/vehicles', d),
  deleteVehicle: (id: string) => del<AnyRecord>(`/logistics-provider/fleet/vehicles/${id}`),
  earnings: () => req<AnyRecord>('/logistics-provider/earnings'),
  requestPayout: (d: unknown) => post<AnyRecord>('/logistics-provider/payouts', d),
};

export const logisticsMarketplaceApi = {
  browse: () => req<AnyRecord[]>('/logistics-marketplace/capacity'),
  reserve: (d: unknown) => post<AnyRecord>('/logistics-marketplace/reservations', d),
  mine: () => req<AnyRecord[]>('/logistics-marketplace/reservations'),
  cancel: (id: string) => del<AnyRecord>(`/logistics-marketplace/reservations/${id}`),
};

export const naira = (kobo?: number | null) => `₦${((kobo ?? 0) / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
export const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const titleCase = (s?: string) => (s ?? '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
