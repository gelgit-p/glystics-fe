import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, LoadingState, ErrorState } from '@/components/shared';
import { adminApi } from '@/lib/admin-api';

export default function AdminAiConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-ai-conversation', id], queryFn: () => adminApi.aiConversation(id!), enabled: !!id });
  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div>
      <PageHeader title={`AI conversation ${data.customerWaId}`} description={`${data.user?.businessName} (${data.user?.email}) · AI detection ${data.user?.aiDeliveryDetectionEnabled ? 'on' : 'OFF'}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Messages</h3>
          <ul className="mt-2 max-h-[480px] space-y-2 overflow-y-auto">{data.messages.map((m: any) => (
            <li key={m.id} className={`rounded-lg p-2 text-sm ${m.direction === 'INBOUND' ? 'bg-muted' : 'bg-primary/10'}`}>
              <p className="text-xs text-muted-foreground">{m.direction} · {m.processingState} · {new Date(m.createdAt).toLocaleString()}</p>
              <p>{m.body ?? '(no text)'}</p>
              {m.processingError && <p className="text-xs text-red-600">{m.processingError}</p>}
            </li>
          ))}</ul>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Drafts & extraction</h3>
          {data.drafts.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No drafts from this conversation.</p>}
          {data.drafts.map((d: any) => (
            <div key={d.id} className="mt-2 rounded-lg border p-3 text-sm">
              <p className="font-medium">{d.packageName ?? 'Unnamed'} → {d.receiverName ?? 'Unknown'} ({d.status})</p>
              <p className="text-xs text-muted-foreground">Confidence {d.confidence ?? '—'} · Missing: {(d.missingFields ?? []).join(', ') || 'none'}</p>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify({ extracted: d.extracted, fields: { receiver: [d.receiverName, d.receiverPhone, d.receiverAddress], pkg: [d.packageName, d.packageWeight, d.packageValue, d.pickupDate] } }, null, 2)}</pre>
              {d.quotes?.length > 0 && <p className="mt-1 text-xs">Quotes: {d.quotes.map((q: any) => `${q.courierName} ${q.amount}${q.currency}`).join(' · ')}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
