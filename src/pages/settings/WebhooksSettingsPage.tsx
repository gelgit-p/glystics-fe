import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Webhook, Check, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { LoadingState, StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const allEvents = [
  'message.sent',
  'message.delivered',
  'message.read',
  'message.failed',
  'delivery.created',
  'delivery.updated',
  'delivery.delivered',
];

export default function WebhooksSettingsPage() {
  const [url, setUrl] = useState('https://api.swiftdrop.ng/webhooks/whatsapp');
  const [events, setEvents] = useState<Record<string, boolean>>(
    Object.fromEntries(allEvents.map((e) => [e, true])),
  );
  const [saving, setSaving] = useState(false);

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => api.getWebhooks(),
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Webhook settings updated');
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Webhook URL */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
          <Webhook className="h-4 w-4 text-muted-foreground" /> Webhook URL
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">We'll send event callbacks to this endpoint.</p>
        <div className="space-y-1.5">
          <Label htmlFor="webhookUrl">Endpoint URL</Label>
          <Input id="webhookUrl" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      {/* Events */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-1 text-base font-semibold">Subscribed Events</h3>
        <p className="mb-4 text-sm text-muted-foreground">Choose which events trigger webhook callbacks.</p>
        <div className="space-y-1">
          {allEvents.map((e) => (
            <div key={e} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                {events[e] ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-border" />
                )}
                <code className="font-mono text-sm">{e}</code>
              </div>
              <Switch checked={events[e]} onCheckedChange={(v) => setEvents({ ...events, [e]: v })} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>

      {/* Active webhooks */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-semibold">Active Webhooks</h3>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="p-5 space-y-3">
            {webhooks?.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm">{wh.url}</code>
                    <StatusBadge status={wh.active ? 'Connected' : 'Disconnected'} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {wh.events.length} events subscribed · Created {new Date(wh.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => toast.success('Webhook deleted')}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
