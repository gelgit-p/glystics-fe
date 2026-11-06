import { History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/ai-api';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/shared';
import { DemoBanner } from './AiShared';

export default function AiAuditPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['ai-audit'], queryFn: aiApi.audit });
  if (isLoading) return <LoadingState text="Loading audit history..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div>
      <PageHeader title="AI Audit History" description="Every AI extraction, clarification, quote, approval and system event for your account." />
      <DemoBanner />
      {data?.length ? <>
        <div className="space-y-3 md:hidden">
          {data.map((a) => <article key={a.id} className="rounded-xl border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">{a.action}</strong><span className="rounded bg-muted px-2 py-0.5 text-xs">{a.actorType}</span></div><p className="mt-2 text-sm text-muted-foreground">{a.entityType}{a.entityId ? ` · ${a.entityId.slice(0, 8)}…` : ''}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p></article>)}
        </div>
        <div className="hidden overflow-x-auto rounded-lg border md:block"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left"><th className="p-3">Time</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Entity</th></tr></thead>
        <tbody>{data.map((a) => <tr key={a.id} className="border-b"><td className="p-3">{new Date(a.createdAt).toLocaleString()}</td><td className="p-3">{a.actorType}</td><td className="p-3">{a.action}</td><td className="p-3">{a.entityType}{a.entityId ? ` · ${a.entityId.slice(0, 8)}…` : ''}</td></tr>)}</tbody></table></div>
      </> : <EmptyState icon={History} title="No audit events" description="AI and approval activity will be recorded here." />}
    </div>
  );
}
