import { CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { aiApi } from '@/lib/ai-api';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/shared';
import { DemoBanner, DraftStatus, money } from './AiShared';

export default function AiApprovalsPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['ai-approvals'], queryFn: aiApi.approvals });
  if (isLoading) return <LoadingState text="Loading approval queue..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div>
      <PageHeader title="Approval Queue" description="Consequential actions require human approval. Approving charges credits and starts the existing checkout → payment → Shipbubble booking flow." />
      <DemoBanner />
      {data?.length ? <div className="space-y-3">{data.map((d) => (
        <Link key={d.id} to={`/ai/drafts/${d.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-4 text-sm hover:bg-accent">
          <span><strong>{d.packageName ?? 'Package'}</strong> → {d.receiverName ?? 'Unknown'} ({d.conversation?.customerWaId ?? ''})<br /><span className="text-muted-foreground">{d.receiverAddress ?? ''}</span></span>
          <span className="flex items-center gap-3">{d.quotes?.[0] && <strong>{money(d.quotes[0].amount, d.quotes[0].currency)} · {d.quotes[0].courierName}</strong>}<DraftStatus status={d.status} /></span>
        </Link>))}</div> : <EmptyState icon={CheckCircle2} title="Queue is empty" description="Drafts that are ready or quoted will appear here for approval." />}
    </div>
  );
}
