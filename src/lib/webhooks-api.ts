import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';

const API_BASE = () => (import.meta.env.VITE_API_URL as string).replace(/\/$/, '');

export type WebhookSubscription = {
  id?: string;
  app_id?: string;
  name?: string;
  url?: string;
  callback_uri?: string;
  override_callback_uri?: string;
  active?: boolean;
  events?: string[];
  createdAt?: string;
  created_at?: string;
  status?: string;
  [key: string]: unknown;
};

export type WebhookLog = {
  id: string;
  userId?: string | null;
  source: 'WHATSAPP' | 'SHIPBUBBLE' | 'BACHS' | string;
  eventType: string;
  direction: string;
  status: string;
  externalId?: string | null;
  phoneNumberId?: string | null;
  summary?: string | null;
  payload?: unknown;
  error?: string | null;
  createdAt: string;
};

async function parse<T>(response: Response, fallback: string): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data as { message?: string } | null)?.message;
    throw new Error(message ?? `${fallback} (${response.status})`);
  }
  return data as T;
}

export async function getWebhookSubscriptions(): Promise<WebhookSubscription[]> {
  const response = await fetch(`${API_BASE()}/whatsapp/get-subscriptions`, { headers: { Accept: 'application/json' } });
  const data = await parse<unknown>(response, 'Failed to fetch webhook subscriptions');
  if (Array.isArray(data)) return data as WebhookSubscription[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['data', 'subscriptions', 'webhooks']) {
      if (Array.isArray(record[key])) return record[key] as WebhookSubscription[];
    }
  }
  return [];
}

export async function subscribeWebhook(payload: { override_callback_uri: string; verify_token: string }): Promise<unknown> {
  const params = new URLSearchParams(payload);
  const response = await fetch(`${API_BASE()}/whatsapp/subscribe?${params.toString()}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  return parse(response, 'Webhook subscription failed');
}

export async function getWebhookLogs(source = '', limit = 100): Promise<WebhookLog[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (source) params.set('source', source);
  const response = await fetch(`${API_BASE()}/whatsapp/webhook-logs?${params.toString()}`, { headers: { Accept: 'application/json' } });
  return parse<WebhookLog[]>(response, 'Failed to fetch webhook logs');
}
