import { useEffect, useRef, useState } from 'react';

export interface AdminNotification {
  id: string;
  type: 'verification.pending';
  providerId: string;
  companyName: string;
  documentName: string;
  submittedAt: string;
  read: boolean;
}

const STORAGE_KEY = 'admin-verification-notifications';

/** True when VITE_API_URL is http(s)://... — upgrades to ws(s):// for the admin bell channel. */
export function wsAdminUrl(token: string | null) {
  if (!token) return null;
  const api = import.meta.env.VITE_API_URL as string | undefined;
  if (!api) return null;
  try {
    const url = new URL(api);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `${url.pathname.replace(/\/$/, '')}/ws/admin`;
    url.search = `?token=${encodeURIComponent(token)}`;
    return url.toString();
  } catch { return null; }
}

function load(): AdminNotification[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AdminNotification[]; } catch { return []; }
}

/**
 * SUPER_ADMIN-only realtime bell feed. Backend enforces the role on the WS upgrade;
 * a failed upgrade simply never opens, so non-admins stay silent here too.
 */
export function useAdminNotifications() {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('userRole') === 'SUPER_ADMIN';
  const [items, setItems] = useState<AdminNotification[]>(() => load());
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30))); }, [items]);

  useEffect(() => {
    if (!isAdmin) return;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const connect = () => {
      const url = wsAdminUrl(localStorage.getItem('accessToken'));
      if (!url) return;
      const ws = new WebSocket(url);
      socketRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(String(ev.data)) as { type?: string; providerId?: string; companyName?: string; documentName?: string; submittedAt?: string };
          if (data.type !== 'verification.pending' || !data.providerId) return;
          const providerId: string = data.providerId;
          setItems((prev) => [{
            id: `${providerId}-${data.submittedAt ?? Date.now()}`,
            type: 'verification.pending' as const,
            providerId,
            companyName: data.companyName ?? 'Logistics provider',
            documentName: data.documentName ?? '',
            submittedAt: data.submittedAt ?? new Date().toISOString(),
            read: false,
          }, ...prev].slice(0, 30));
        } catch { /* ignore malformed frames */ }
      };
      ws.onclose = () => { if (!closed) retry = setTimeout(connect, 5000); };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => { closed = true; if (retry) clearTimeout(retry); socketRef.current?.close(); };
  }, [isAdmin]);

  const unread = items.filter((i) => !i.read).length;
  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  const clear = () => setItems([]);
  return { items, unread, markAllRead, clear, enabled: isAdmin };
}
