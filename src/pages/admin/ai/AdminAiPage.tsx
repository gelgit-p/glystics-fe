import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { aiApi } from '@/lib/ai-api';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState, StatusBadge } from '@/components/admin/AdminTable';

export default function AdminAiPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const health = useQuery({ queryKey: ['ai-admin-health'], queryFn: aiApi.adminAiHealth });
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-ai-agents', search, page], queryFn: () => adminApi.aiAgents({ search: search || undefined, page, limit: 20 }) });
  const setDetection = useMutation({ mutationFn: (u: { id: string; aiDeliveryDetectionEnabled: boolean }) => aiApi.adminSetDetection(u.id, !u.aiDeliveryDetectionEnabled), onSuccess: () => { toast.success('AI detection updated'); qc.invalidateQueries({ queryKey: ['admin-ai-agents'] }); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed') });

  return (
    <div>
      <PageHeader title="AI Agents" description="Baseten model status, detection activity, extraction logs, and per-tenant controls." />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Provider / Model</p><p className="mt-1 font-semibold">{data?.provider.provider ?? health.data?.provider ?? '—'} / {data?.provider.model ?? health.data?.model ?? '—'}</p><p className="text-xs text-muted-foreground">Mode: {data?.provider.mode ?? health.data?.mode} · Global: {(data?.provider.globalEnabled ?? true) ? 'on' : 'OFF (kill-switch)'}</p></div>
        {[['Conversations', data?.conversations.total], ['Failed messages', data?.errors?.length], ['Extraction logs', data?.extractionActivity?.length]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-bold">{Number(v ?? 0)}</p></div>
        ))}
      </div>
      {data && Object.keys(data.draftsByStatus).length > 0 && (
        <div className="mb-4 rounded-xl border bg-card p-4 text-sm"><strong>Drafts by status:</strong> {Object.entries(data.draftsByStatus).map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>
      )}
      <div className="mb-4"><AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customer phone or tenant email..." /></div>
      {(() => {
        const empty = <DataState isLoading={isLoading} error={error} items={data?.conversations.items} refetch={() => refetch()} emptyTitle="No AI conversations" emptyHint="WhatsApp conversations processed by AI appear here." />;
        if (isLoading || error || !data?.conversations.items?.length) return empty;
        return (<>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[1000px] text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Conversation</th><th className="p-3">Tenant</th><th className="p-3">AI detection</th><th className="p-3">Drafts</th><th className="p-3">Updated</th></tr></thead>
              <tbody>{data!.conversations.items.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3"><Link to={`/admin/ai/conversations/${c.id}`} className="font-medium hover:underline">{c.customerWaId}</Link><div className="text-xs text-muted-foreground">{c.status} · last: {c.messages?.[0]?.body?.slice(0, 60) ?? '—'}</div></td>
                  <td className="p-3 text-xs">{c.user?.businessName}<br />{c.user?.email}</td>
                  <td className="p-3"><Switch checked={c.user?.aiDeliveryDetectionEnabled ?? true} onCheckedChange={() => setDetection.mutate({ id: c.user.id, aiDeliveryDetectionEnabled: c.user?.aiDeliveryDetectionEnabled ?? true })} aria-label={`AI detection for ${c.user?.email}`} /></td>
                  <td className="p-3 text-xs">{c.drafts.map((d: any) => <span key={d.id} className="mr-1"><StatusBadge status={d.status} /></span>)}</td>
                  <td className="p-3 text-xs">{new Date(c.updatedAt).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <AdminPager page={data!.conversations.page} total={data!.conversations.total} limit={data!.conversations.limit} onPage={setPage} />
          <h2 className="mb-2 mt-8 font-semibold">Model errors (failed messages)</h2>
          {data!.errors.length === 0 ? <p className="text-sm text-muted-foreground">No failed messages.</p> : (
            <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[800px] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Message</th><th className="p-3">Customer</th><th className="p-3">Error</th><th className="p-3">At</th></tr></thead><tbody>{data!.errors.map((m: any) => <tr key={m.id} className="border-b last:border-0"><td className="max-w-[300px] truncate p-3">{m.body ?? '—'}</td><td className="p-3 text-xs">{m.conversation?.customerWaId}</td><td className="max-w-[300px] truncate p-3 text-xs text-red-600">{m.processingError ?? '—'}</td><td className="p-3 text-xs">{new Date(m.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>
          )}
          <h2 className="mb-2 mt-8 font-semibold">Extraction activity (latest AI audit)</h2>
          {data!.extractionActivity.length === 0 ? <p className="text-sm text-muted-foreground">No extraction activity yet.</p> : (
            <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[800px] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Action</th><th className="p-3">Entity</th><th className="p-3">Metadata</th><th className="p-3">At</th></tr></thead><tbody>{data!.extractionActivity.map((a: any) => <tr key={a.id} className="border-b last:border-0"><td className="p-3">{a.actorType} · {a.action}</td><td className="p-3 text-xs">{a.entityType}/{String(a.entityId ?? '').slice(0, 8)}</td><td className="max-w-[320px] truncate p-3 text-xs text-muted-foreground">{JSON.stringify(a.metadata ?? {})}</td><td className="p-3 text-xs">{new Date(a.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>
          )}
          <div className="mt-4"><Button variant="outline" onClick={() => { setSearch(''); setPage(1); refetch(); }}>Refresh agent activity</Button></div>
        </>);
      })()}
    </div>
  );
}
