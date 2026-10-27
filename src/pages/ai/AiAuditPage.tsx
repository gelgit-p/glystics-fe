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
      {data?.length ? <div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left"><th className="p-3">Time</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Entity</th></tr></thead>
      <tbody>{data.map((a) => <tr key={a.id} className="border-b"><td className="p-3">{new Date(a.createdAt).toLocaleString()}</td><td className="p-3">{a.actorType}</td><td className="p-3">{a.action}</td><td className="p-3">{a.entityType}{a.entityId ? ` · ${a.entityId.slice(0, 8)}…` : ''}</td></tr>)}</tbody></table></div>
      : <EmptyState icon={History} title="No audit events" description="AI and approval activity will be recorded here." />}
    </div>
  );
}
