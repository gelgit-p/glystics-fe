import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, RefreshCw, ScrollText } from 'lucide-react';
import { getWebhookLogs, type WebhookLog } from '@/lib/webhooks-api';
import { LoadingState, StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';

function badgeStatus(status: string) {
  if (['PROCESSED', 'VERIFIED', 'SUBSCRIBED'].includes(status)) return 'Connected';
  if (status === 'RECEIVED' || status === 'CHECKED') return 'Sent';
  if (status === 'FAILED') return 'Failed';
  if (status === 'DUPLICATE') return 'Pending';
  return 'Disconnected';
}

function LogRow({ log }: { log: WebhookLog }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border p-4">
      <button type="button" className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setOpen((v) => !v)}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-sm">{log.eventType}</code>
            <StatusBadge status={badgeStatus(log.status)} />
            <span className="rounded bg-muted px-2 py-0.5 text-xs">{log.source}</span>
            <span className="rounded bg-muted px-2 py-0.5 text-xs">{log.direction}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{log.summary ?? 'Webhook event received'}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(log.createdAt).toLocaleString()}
            {log.externalId ? ` · ID ${log.externalId}` : ''}
            {log.phoneNumberId ? ` · Phone ${log.phoneNumberId}` : ''}
          </p>
          {log.error && <p className="mt-2 text-sm text-destructive">{log.error}</p>}
        </div>
        {open ? <ChevronDown className="mt-1 h-4 w-4 shrink-0" /> : <ChevronRight className="mt-1 h-4 w-4 shrink-0" />}
      </button>
      {open && <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-muted/60 p-3 text-xs">{JSON.stringify(log.payload ?? {}, null, 2)}</pre>}
    </div>
  );
}

export default function WebhookLogs() {
  const [source, setSource] = useState('');
  const logs = useQuery({
    queryKey: ['whatsapp-webhook-logs', source],
    queryFn: () => getWebhookLogs(source),
    refetchInterval: 30_000,
  });

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold"><ScrollText className="h-4 w-4 text-muted-foreground" /> Webhook Logs</h3>
          <p className="mt-1 text-sm text-muted-foreground">Recent inbound WhatsApp, Shipbubble and checkout events for your account. Refreshes every 30 seconds.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Filter webhook logs by source">
            <option value="">All sources</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="SHIPBUBBLE">Shipbubble</option>
            <option value="BACHS">Checkout</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => logs.refetch()} disabled={logs.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${logs.isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>
      <div className="p-5">
        {logs.isLoading ? <LoadingState text="Loading webhook logs..." /> : logs.isError ? (
          <div>
            <p className="text-sm text-destructive">{logs.error instanceof Error ? logs.error.message : 'Failed to load webhook logs.'}</p>
            <Button className="mt-3" variant="outline" size="sm" onClick={() => logs.refetch()}>Try again</Button>
          </div>
        ) : !logs.data?.length ? (
          <div className="py-10 text-center">
            <ScrollText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h4 className="font-medium">No webhook events yet</h4>
            <p className="mt-1 text-sm text-muted-foreground">Subscribe above, then send a WhatsApp message or trigger a shipment update to see events here.</p>
          </div>
        ) : (
          <div className="space-y-3">{logs.data.map((log) => <LogRow key={log.id} log={log} />)}</div>
        )}
      </div>
    </section>
  );
}
