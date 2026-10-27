import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';

const base = () => import.meta.env.VITE_API_URL as string;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, { headers: { 'Content-Type': 'application/json', accept: 'application/json' }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string })?.message ?? `Request failed (${res.status})`);
  return data as T;
}

export interface AiOverview { aiMode: 'live' | 'demo'; demoLabel?: string; conversations: number; pendingApprovals: number; auditEvents: number; draftsByStatus: Record<string, number>; totalDrafts: number; }
export interface AiQuote { id: string; courierName: string; courierId: string; serviceCode: string; amount: number; currency: string; deliveryEta?: string | null; score: number; scoreReasons: string[]; }
export interface AiDraft {
  id: string; status: string; missingFields: string[]; confidence?: number | null; deliveryId?: string | null;
  senderName?: string | null; senderPhone?: string | null; senderAddress?: string | null;
  receiverName?: string | null; receiverPhone?: string | null; receiverAddress?: string | null;
  packageName?: string | null; packageWeight?: string | null; packageValue?: string | null; pickupDate?: string | null;
  quotes?: AiQuote[]; conversation?: { customerWaId: string } | null; createdAt: string; updatedAt: string;
}
export interface AiMessage { id: string; direction: string; body?: string | null; processingState: string; createdAt: string; }
export interface AiConversation { id: string; customerWaId: string; status: string; updatedAt: string; messages?: AiMessage[]; drafts?: AiDraft[]; }
export interface AiAudit { id: string; actorType: string; action: string; entityType: string; entityId?: string | null; createdAt: string; metadata?: Record<string, unknown> | null; }

export const aiApi = {
  overview: () => req<AiOverview>('/ai/overview'),
  conversations: () => req<AiConversation[]>('/ai/conversations'),
  conversation: (id: string) => req<AiConversation & { messages: AiMessage[]; drafts: AiDraft[] }>(`/ai/conversations/${id}`),
  drafts: (status?: string) => req<AiDraft[]>(`/ai/drafts${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  draft: (id: string) => req<AiDraft>(`/ai/drafts/${id}`),
  updateDraft: (id: string, body: Record<string, unknown>) => req<AiDraft>(`/ai/drafts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  fetchQuotes: (id: string) => req<{ quotes: AiQuote[] }>(`/ai/drafts/${id}/quotes`, { method: 'POST', body: '{}' }),
  approvals: () => req<AiDraft[]>('/ai/approvals'),
  approve: (id: string, quoteId: string) => req<{ deliveryId: string; trackingId?: string; checkout?: { checkout_url: string }; note?: string }>(`/ai/drafts/${id}/approve`, { method: 'POST', body: JSON.stringify({ quoteId }) }),
  reject: (id: string) => req(`/ai/drafts/${id}/reject`, { method: 'POST', body: '{}' }),
  audit: () => req<AiAudit[]>('/ai/audit'),
  simulateInbound: (text: string) => req<{ simulated: boolean; aiMode: string; conversationId: string }>('/ai/simulate-inbound', { method: 'POST', body: JSON.stringify({ text }) }),
};
