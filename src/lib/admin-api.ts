import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';

const base = () => import.meta.env.VITE_API_URL as string;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, { headers: { 'Content-Type': 'application/json', accept: 'application/json' }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string })?.message ?? `Request failed (${res.status})`);
  return data as T;
}

export interface Paged<T> { items: T[]; total: number; page: number; limit: number; }

export interface PlatformOverview {
  users: { total: number; superAdmins: number; suspended: number; detectionEnabled: number };
  deliveries: { total: number; byStatus: Record<string, number> };
  credits: {
    deliveryBalance: number;
    points: number;
    transactions: number;
    purchasesByStatus: { status: string; count: number; amountKobo: number }[];
    /** @deprecated older API responses used this field instead of purchasesByStatus */
    purchases?: number | { status: string; count?: number; amountKobo?: number }[];
  };
  ai: { mode: string; provider: string; model: string; globalEnabled: boolean; conversations: number; drafts: number; approvals: number; failedMessages: number; detectionEnabledTenants: number };
  notifications: { total: number; failed: number };
  templates: { total: number; pendingReview: number };
  automations: { total: number; active: number; totalRuns: number };
  whatsapp: { connectedTenants: number; webhookEvents: number; webhookFailed: number };
}

export interface PlatformUser {
  id: string; email: string; businessName: string; fullName: string; role: string;
  emailConfirmed: boolean; aiDeliveryDetectionEnabled: boolean; facebookConnectStatus: boolean;
  webhookStatus: boolean; displayPhoneNumber?: string | null; selectedWabaId?: string | null;
  selectedPhoneNumberId: string[]; createdAt: string;
  creditWallet?: { balance: number; points: number } | null;
  _count: { aiConversations: number; deliveryDrafts: number; automations: number; messageTemplates: number };
}

export interface PlatformDelivery {
  id: string; userId?: string | null; trackingId: string;
  senderName: string; senderPhone: string; senderAddress: string;
  receiverName: string; receiverPhone: string; receiverAddress: string;
  packageName: string; courier_name?: string | null; deliveryStatus?: string | null;
  paymentStatus: string; bookingStatus: string; paymentAmount?: string | null;
  createdAt: string; updatedAt: string;
}

export interface PlatformPurchase {
  id: string; paymentReference: string; amountKobo: number; credits: number;
  status: string; checkoutUrl?: string | null; createdAt: string;
  package: { name: string }; wallet: { userId: string; user: { email: string; businessName: string } };
}

export interface PlatformNotification { id: string; userId: string; recipientPhone: string; templateName: string; templateLanguage: string; status?: string | null; deliveryTrackingId?: string | null; createdAt: string; }
export interface PlatformTemplate { id: string; name: string; language: string; status: string; category: string; user: { id: string; email: string; businessName: string; selectedWabaId?: string | null } | null; createdAt: string; updatedAt: string; }
export interface PlatformAutomation { id: string; name: string; trigger: string; triggerValue?: string | null; action: string; actionTemplate: string; enabled: boolean; totalRuns: number; lastTriggered?: string | null; user: { id: string; email: string; businessName: string } | null; }
export interface PlatformWaConnection { id: string; email: string; businessName: string; facebookConnectStatus: boolean; webhookStatus: boolean; selectedWabaId?: string | null; selectedFacebookBusinessName?: string | null; displayPhoneNumber?: string | null; selectedPhoneNumberId: string[]; selectedPhoneNumberQualityRating?: string | null; }

const q = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '' && v !== null) sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const adminApi = {
  overview: () => req<PlatformOverview>('/admin/overview'),
  users: (p: { search?: string; page?: number; limit?: number }) => req<Paged<PlatformUser>>(`/admin/users${q(p)}`),
  user: (id: string) => req<any>(`/admin/users/${id}`),
  setRole: (id: string, role: 'USER' | 'SUPER_ADMIN' | 'LOGISTICS_PROVIDER') => req(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  setLogisticsProvider: (id: string, enabled: boolean) => req(`/admin/users/${id}/logistics-provider`, { method: 'PATCH', body: JSON.stringify({ enabled }) }),
  setSuspended: (id: string, suspended: boolean) => req(`/admin/users/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspended }) }),
  setDetection: (id: string, aiDeliveryDetectionEnabled: boolean) => req(`/admin/users/${id}/ai-detection`, { method: 'PATCH', body: JSON.stringify({ aiDeliveryDetectionEnabled }) }),
  deleteUser: (id: string) => req(`/admin/users/${id}`, { method: 'DELETE' }),
  userTransactions: (id: string, limit = 50) => req<{ items: any[] }>(`/admin/users/${id}/transactions?limit=${limit}`),
  adjustCredits: (id: string, amount: number, description?: string) => req(`/admin/users/${id}/credits/adjust`, { method: 'POST', body: JSON.stringify({ amount, description }) }),
  deliveries: (p: { search?: string; status?: string; page?: number; limit?: number }) => req<Paged<PlatformDelivery>>(`/admin/deliveries${q(p)}`),
  delivery: (id: string) => req<any>(`/admin/deliveries/${id}`),
  updateDelivery: (id: string, body: { deliveryStatus?: string; paymentStatus?: string; bookingStatus?: string }) => req(`/admin/deliveries/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  cancelDelivery: (id: string) => req(`/admin/deliveries/${id}/cancel`, { method: 'POST' }),
  deleteDelivery: (id: string) => req(`/admin/deliveries/${id}`, { method: 'DELETE' }),
  billing: (p: { search?: string; page?: number; limit?: number }) => req<{ totals: any; items: PlatformPurchase[]; total: number; page: number; limit: number }>(`/admin/billing/overview${q(p)}`),
  notifications: (p: { search?: string; status?: string; page?: number; limit?: number }) => req<Paged<PlatformNotification>>(`/admin/notifications${q(p)}`),
  templates: (p: { search?: string; status?: string; page?: number; limit?: number }) => req<Paged<PlatformTemplate>>(`/admin/templates${q(p)}`),
  deleteTemplate: (id: string) => req(`/admin/templates/${id}`, { method: 'DELETE' }),
  automations: (p: { search?: string; enabled?: string; page?: number; limit?: number }) => req<Paged<PlatformAutomation>>(`/admin/automations${q(p)}`),
  toggleAutomation: (id: string, enabled: boolean) => req(`/admin/automations/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled }) }),
  deleteAutomation: (id: string) => req(`/admin/automations/${id}`, { method: 'DELETE' }),
  whatsapp: (p: { search?: string; page?: number; limit?: number }) => req<Paged<PlatformWaConnection>>(`/admin/whatsapp/connections${q(p)}`),
  whatsappActivity: (userId?: string, limit = 50) => req<any>(`/admin/whatsapp/activity${q({ userId, limit })}`),
  disconnectWhatsapp: (userId: string) => req(`/admin/whatsapp/${userId}/disconnect`, { method: 'POST' }),
  aiAgents: (p: { search?: string; page?: number; limit?: number }) => req<any>(`/admin/ai/agents${q(p)}`),
  aiConversation: (id: string) => req<any>(`/admin/ai/conversations/${id}`),
};
