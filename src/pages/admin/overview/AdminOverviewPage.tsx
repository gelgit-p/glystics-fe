import { useQuery } from '@tanstack/react-query';
import { Package, Users, CreditCard, Bot, Bell, FileText, Zap, MessageCircle, AlertTriangle } from 'lucide-react';
import { PageHeader, LoadingState, ErrorState } from '@/components/shared';
import { adminApi } from '@/lib/admin-api';
import { aiApi } from '@/lib/ai-api';

export default function AdminOverviewPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview });
  const health = useQuery({ queryKey: ['ai-admin-health'], queryFn: aiApi.adminAiHealth });

  if (isLoading) return <LoadingState text="Loading platform overview..." />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;

  const cards = [
    { label: 'Users', value: data.users.total, hint: `${data.users.superAdmins} super admins · ${data.users.suspended} unconfirmed · ${data.users.detectionEnabled} AI on`, icon: Users },
    { label: 'Deliveries', value: data.deliveries.total, hint: Object.entries(data.deliveries.byStatus).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'No deliveries yet', icon: Package },
    { label: 'Credit balance (all wallets)', value: data.credits.deliveryBalance, hint: `${data.credits.transactions} transactions · ${typeof data.credits.purchases === 'number' ? `${data.credits.purchases} purchases` : `${(data.credits.purchases as any[]).reduce((s, p) => s + p.count, 0)} purchases`}`, icon: CreditCard },
    { label: 'AI conversations', value: data.ai.conversations, hint: `${data.ai.drafts} drafts · ${data.ai.approvals} approvals · ${data.ai.failedMessages} failed · ${data.ai.mode} ${data.ai.provider}/${data.ai.model}`, icon: Bot },
    { label: 'Notifications', value: data.notifications.total, hint: `${data.notifications.failed} failed`, icon: Bell },
    { label: 'Templates', value: data.templates.total, hint: `${data.templates.pendingReview} pending review`, icon: FileText },
    { label: 'Automations', value: data.automations.total, hint: `${data.automations.active} active · ${data.automations.totalRuns} runs`, icon: Zap },
    { label: 'WhatsApp tenants', value: data.whatsapp.connectedTenants, hint: `${data.whatsapp.webhookEvents} webhook events · ${data.whatsapp.webhookFailed} failed`, icon: MessageCircle },
  ];

  return (
    <div>
      <PageHeader title="Platform overview" description="Live platform-wide statistics across all tenants. No demo data — everything below is real." />
      {health.data && !health.data.ok && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" /> Baseten AI is in {health.data.mode} mode ({health.data.provider}/{health.data.model}){health.data.error ? ` — ${health.data.error}` : ''}.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><c.icon className="h-4 w-4" /><p className="text-sm">{c.label}</p></div>
            <p className="mt-1 text-3xl font-bold">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.hint}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Deliveries by status</h2>
        {Object.keys(data.deliveries.byStatus).length === 0 && <p className="mt-2 text-sm text-muted-foreground">No deliveries yet.</p>}
        <div className="mt-3 space-y-2">
          {Object.entries(data.deliveries.byStatus).map(([status, count]) => {
            const total = Math.max(data.deliveries.total, 1);
            return (
              <div key={status} className="flex items-center gap-3 text-sm">
                <span className="w-40 truncate">{status}</span>
                <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, Math.round((count / total) * 100))}%` }} /></div>
                <span className="w-12 text-right font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
