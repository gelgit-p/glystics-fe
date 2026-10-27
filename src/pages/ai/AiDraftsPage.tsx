import { Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { aiApi } from '@/lib/ai-api';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/shared';
import { DemoBanner, DraftStatus } from './AiShared';

export default function AiDraftsPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['ai-drafts'], queryFn: () => aiApi.drafts() });
  if (isLoading) return <LoadingState text="Loading drafts..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div>
      <PageHeader title="Delivery Drafts" description="AI-extracted deliveries. Nothing is booked until a human approves, checkout is paid, and Shipbubble confirms." />
      <DemoBanner />
      {data?.length ? <div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm">
        <thead><tr className="border-b bg-muted/50 text-left"><th className="p-3">Package</th><th className="p-3">Receiver</th><th className="p-3">Status</th><th className="p-3">Missing</th><th className="p-3">Updated</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.id} className="border-b"><td className="p-3"><Link className="text-primary underline" to={`/ai/drafts/${d.id}`}>{d.packageName ?? 'Unnamed'}</Link></td><td className="p-3">{d.receiverName ?? '—'}<br /><span className="text-muted-foreground">{d.receiverAddress ?? ''}</span></td><td className="p-3"><DraftStatus status={d.status} /></td><td className="p-3">{d.missingFields.join(', ') || '—'}</td><td className="p-3">{new Date(d.updatedAt).toLocaleString()}</td></tr>)}</tbody>
      </table></div> : <EmptyState icon={Package} title="No drafts" description="Drafts are created automatically from WhatsApp delivery requests." />}
    </div>
  );
}
