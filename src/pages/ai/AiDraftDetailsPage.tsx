import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { aiApi } from '@/lib/ai-api';
import { ErrorState, LoadingState, PageHeader } from '@/components/shared';
import { DemoBanner, DraftStatus, money } from './AiShared';

const FIELDS = ['senderName','senderPhone','senderAddress','receiverName','receiverPhone','receiverAddress','packageName','packageWeight','packageValue','pickupDate'] as const;

export default function AiDraftDetailsPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['ai-draft', id], queryFn: () => aiApi.draft(id) });
  const [form, setForm] = useState<Record<string, string>>({});
  const [quoteId, setQuoteId] = useState('');
  useEffect(() => { if (data) setForm(Object.fromEntries(FIELDS.map((f) => [f, String((data as unknown as Record<string, unknown>)[f] ?? '')]))); }, [data]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['ai-draft', id] });
  const save = useMutation({ mutationFn: () => aiApi.updateDraft(id, form), onSuccess: () => { toast.success('Draft updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed') });
  const quotes = useMutation({ mutationFn: () => aiApi.fetchQuotes(id), onSuccess: (r) => { toast.success(`${r.quotes.length} courier quotes fetched from Shipbubble`); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Quotes failed') });
  const approve = useMutation({ mutationFn: () => aiApi.approve(id, quoteId), onSuccess: (r) => { toast.success(`Delivery ${r.trackingId ?? r.deliveryId} created — pay checkout to trigger Shipbubble booking`); if (r.checkout?.checkout_url) window.open(r.checkout.checkout_url, '_blank'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Approval failed') });
  const reject = useMutation({ mutationFn: () => aiApi.reject(id), onSuccess: () => { toast.success('Draft rejected'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Reject failed') });
  if (isLoading) return <LoadingState text="Loading draft..." />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;
  const recommended = data.quotes?.[0];
  return (
    <div>
      <PageHeader title="Delivery Draft" description="Review extracted details, compare Shipbubble couriers, then approve. AI data is re-validated by the backend."><DraftStatus status={data.status} /></PageHeader>
      <DemoBanner />
      {data.missingFields.length > 0 && <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Missing before quotes: {data.missingFields.join(', ')}</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Extracted details {data.confidence != null && <span className="text-sm text-muted-foreground">(confidence {Math.round(data.confidence * 100)}%)</span>}</h2>
          <div className="grid gap-3 sm:grid-cols-2">{FIELDS.map((f) => <label key={f} className="text-sm">{f}<input className="mt-1 w-full rounded-md border p-2" value={form[f] ?? ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} /></label>)}</div>
          <div className="mt-4 flex gap-2"><button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => save.mutate()}>Save corrections</button>
          <button className="rounded-md border px-4 py-2 text-sm disabled:opacity-50" disabled={!!data.missingFields.length || quotes.isPending} onClick={() => quotes.mutate()}>Fetch Shipbubble quotes</button></div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Provider quotes (Shipbubble couriers)</h2>
          {data.quotes?.length ? <div className="space-y-2">{data.quotes.map((q, i) => (
            <label key={q.id} className="flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm">
              <span><input type="radio" name="quote" className="mr-2" checked={quoteId === q.id} onChange={() => setQuoteId(q.id)} /><strong>{q.courierName}</strong> · {q.serviceCode}{i === 0 && <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">Recommended</span>}<br /><span className="text-muted-foreground">{q.scoreReasons.join(' · ')}{q.deliveryEta ? ` · ETA ${q.deliveryEta}` : ''}</span></span>
              <strong>{money(q.amount, q.currency)}</strong>
            </label>))}
            {recommended && !quoteId && <p className="text-sm text-muted-foreground">Recommended: {recommended.courierName} ({money(recommended.amount, recommended.currency)}) — select it or another quote to approve.</p>}
            <div className="flex gap-2 pt-2"><button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={!quoteId || approve.isPending} onClick={() => approve.mutate()}>Approve & create delivery</button>
            <button className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive" onClick={() => reject.mutate()}>Reject</button></div>
            <p className="text-xs text-muted-foreground">Approval charges delivery credits and creates a Bachs checkout via the existing flow. Shipbubble booking happens only after payment completes — an AI quote alone is never a booking.</p>
          </div> : <p className="text-sm text-muted-foreground">No quotes yet. Complete missing fields, then fetch quotes.</p>}
          {data.deliveryId && <p className="mt-3 text-sm">Linked delivery: <a className="text-primary underline" href={`/deliveries/${data.deliveryId}`}>{data.deliveryId}</a></p>}
        </div>
      </div>
    </div>
  );
}
