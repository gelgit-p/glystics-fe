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
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['ai-draft', id], queryFn: () => aiApi.draft(id), refetchInterval: (query) => { const s = (query.state.data as { status?: string } | undefined)?.status; return s === 'PAYMENT_LINK_SENT' ? 10_000 : 15_000; } });
  const senderProfile = useQuery({ queryKey: ['ai-sender-profile'], queryFn: aiApi.senderProfile });
  const [form, setForm] = useState<Record<string, string>>({});
  const [quoteId, setQuoteId] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  useEffect(() => {
    if (!data) return;
    const next = Object.fromEntries(FIELDS.map((f) => [f, String((data as unknown as Record<string, unknown>)[f] ?? '')])) as Record<string, string>;
    const p = senderProfile.data;
    if (p) {
      if (!next.senderName && p.senderName) next.senderName = p.senderName;
      if (!next.senderPhone && p.senderPhone) next.senderPhone = p.senderPhone;
      if (!next.senderAddress && p.senderAddress) next.senderAddress = p.senderAddress;
    }
    setForm(next);
  }, [data, senderProfile.data]);
  useEffect(() => {
    if (data?.customerSelectedQuoteId) setQuoteId(data.customerSelectedQuoteId);
    else if (!quoteId && data?.quotes?.[0]) setQuoteId(data.quotes[0].id);
  }, [data?.customerSelectedQuoteId, data?.quotes, quoteId]);
  const offer = useQuery({ queryKey: ['ai-quote-offer', id, data?.quotes?.length], queryFn: () => aiApi.quoteOffer(id), enabled: !!data?.quotes?.length });
  const paymentLinkSentEarly = data?.status === 'PAYMENT_LINK_SENT';
  useEffect(() => {
    if (!paymentLinkSentEarly || checkPayment.isPending) return;
    const timer = setTimeout(() => checkPayment.mutate(), 1200);
    return () => clearTimeout(timer);
    // Run when entering PAYMENT_LINK_SENT; interval polling below covers later checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentLinkSentEarly]);
  useEffect(() => {
    if (!paymentLinkSentEarly) return;
    const interval = setInterval(() => { if (!checkPayment.isPending) checkPayment.mutate(); }, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentLinkSentEarly]);
  useEffect(() => { if (offer.data?.message) setQuoteMessage((current) => current || offer.data.message); }, [offer.data?.message]);
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['ai-draft', id] }); qc.invalidateQueries({ queryKey: ['ai-approvals'] }); };
  const save = useMutation({ mutationFn: () => aiApi.updateDraft(id, form), onSuccess: () => { toast.success('Draft updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed') });
  const quotes = useMutation({ mutationFn: () => aiApi.fetchQuotes(id), onSuccess: (r) => { toast.success(`${r.quotes.length} courier quotes fetched from Shipbubble`); setQuoteMessage(''); invalidate(); qc.invalidateQueries({ queryKey: ['ai-quote-offer', id] }); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Quotes failed') });
  const sendQuote = useMutation({ mutationFn: () => aiApi.sendQuote(id, quoteMessage), onSuccess: () => { toast.success('Quote sent to customer on WhatsApp — waiting for their option number'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to send quote') });
  const approve = useMutation({ mutationFn: () => aiApi.approve(id, quoteId), onSuccess: (r) => { toast.success(`Delivery ${r.trackingId ?? r.deliveryId} created — use Send payment link to text checkout to the customer`); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Approval failed') });
  const sendPaymentLink = useMutation({ mutationFn: () => aiApi.sendPaymentLink(id), onSuccess: (r) => { toast.success(`Payment link sent to customer on WhatsApp${r.trackingId ? ` · ${r.trackingId}` : ''}`); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to send payment link') });
  const checkPayment = useMutation({ mutationFn: () => aiApi.checkPayment(id), onSuccess: (r) => { if (r.labelCreated) toast.success('Payment successful — Shipbubble shipping/label created'); else if (r.paymentStatus === 'PAID') toast.success('Payment successful — label is being created'); else if (r.paymentStatus === 'FAILED') toast.error('Payment failed or expired'); else toast.info(r.message); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to check payment') });
  const reject = useMutation({ mutationFn: () => aiApi.reject(id), onSuccess: () => { toast.success('Draft rejected'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Reject failed') });
  if (isLoading) return <LoadingState text="Loading draft..." />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;
  const recommended = data.quotes?.[0];
  const awaitingCustomer = data.status === 'AWAITING_CUSTOMER_SELECTION';
  const customerSelected = data.status === 'CUSTOMER_SELECTED' || data.status === 'PAYMENT_LINK_SENT';
  const paymentLinkSent = data.status === 'PAYMENT_LINK_SENT';
  const booked = data.status === 'BOOKED';
  const selectedQuote = data.quotes?.find((q) => q.id === data.customerSelectedQuoteId);
  return (
    <div>
      <PageHeader title="Delivery Draft" description="Review extracted details, compare Shipbubble couriers, send quote options to the customer, then approve after selection."><DraftStatus status={data.status} /></PageHeader>
      <DemoBanner />
      {data.missingFields.length > 0 && <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Missing before quotes: {data.missingFields.join(', ')}{data.missingFields.some((f) => f.startsWith('sender')) && <> — sender details come from your profile: set them in <a className="underline" href="/settings/profile">Profile settings</a> or fill them below and save.</>}</div>}
      {awaitingCustomer && <div className="mb-4 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-900">Quote sent to the customer on WhatsApp{data.quoteOfferSentAt ? ` at ${new Date(data.quoteOfferSentAt).toLocaleString()}` : ''}. Waiting for them to reply with an option number. This page refreshes automatically.</div>}
      {customerSelected && selectedQuote && <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">Customer selected: <strong>{selectedQuote.courierName} — {money(selectedQuote.amount, selectedQuote.currency)}</strong>{data.customerSelectionAt ? ` at ${new Date(data.customerSelectionAt).toLocaleString()}` : ''}. {paymentLinkSent ? 'Payment link has been sent to the customer in WhatsApp chat.' : 'Payment link will be texted to the customer automatically; you can also resend it below.'}</div>}
      {(paymentLinkSent || booked || data.deliveryId) && <div className="mb-4 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Payment & shipping label</h2>
            <p className="mt-1 text-sm text-muted-foreground">{booked ? 'Payment successful and Shipbubble shipping/label has been created.' : paymentLinkSent ? 'Waiting for customer payment. This page auto-checks Bachs every 30 seconds; verified payment immediately creates the Shipbubble label request.' : 'Payment link created. Check status after the customer pays.'}</p>
            {data.deliveryId && <p className="mt-2 text-sm">Delivery: <a className="text-primary underline" href={`/deliveries/${data.deliveryId}`}>{data.deliveryId}</a></p>}
          </div>
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={checkPayment.isPending || booked} onClick={() => checkPayment.mutate()}>{checkPayment.isPending ? 'Checking payment...' : booked ? 'Label created' : 'Check payment & create label'}</button>
        </div>
        {checkPayment.data && <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm">
          <p><strong>Status:</strong> {checkPayment.data.message}</p>
          <p className="mt-1 text-muted-foreground">Payment: {checkPayment.data.paymentStatus} · Booking: {checkPayment.data.bookingStatus ?? '—'} · Provider: {checkPayment.data.providerStatus ?? '—'}</p>
          {checkPayment.data.shipbubbleOrderId && <p className="mt-1">Shipbubble order: <strong>{checkPayment.data.shipbubbleOrderId}</strong></p>}
          {checkPayment.data.trackingUrl && <p className="mt-1">Tracking: <a className="text-primary underline" href={checkPayment.data.trackingUrl} target="_blank" rel="noreferrer">{checkPayment.data.trackingUrl}</a></p>}
          {checkPayment.data.bookingError && <p className="mt-1 text-destructive">{checkPayment.data.bookingError}</p>}
        </div>}
      </div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Extracted details {data.confidence != null && <span className="text-sm text-muted-foreground">(confidence {Math.round(data.confidence * 100)}%)</span>}</h2>
          <div className="grid gap-3 sm:grid-cols-2">{FIELDS.map((f) => <label key={f} className="text-sm">{f}<input className="mt-1 w-full rounded-md border p-2" value={form[f] ?? ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} /></label>)}</div>
          <div className="mt-4 flex gap-2"><button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => save.mutate()}>Save corrections</button>
          <button className="rounded-md border px-4 py-2 text-sm disabled:opacity-50" disabled={!!data.missingFields.length || quotes.isPending} onClick={() => quotes.mutate()}>Fetch Shipbubble quotes</button></div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 font-semibold">Provider quotes (Shipbubble couriers)</h2>
            {data.quotes?.length ? <div className="space-y-2">{data.quotes.map((q, i) => (
              <label key={q.id} className="flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm">
                <span><input type="radio" name="quote" className="mr-2" checked={quoteId === q.id} onChange={() => setQuoteId(q.id)} /><strong>{i + 1}. {q.courierName}</strong> · {q.serviceCode}{i === 0 && <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">Recommended</span>}{data.customerSelectedQuoteId === q.id && <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Customer selected</span>}<br /><span className="text-muted-foreground">{q.scoreReasons.join(' · ')}{q.deliveryEta ? ` · ETA ${q.deliveryEta}` : ''}</span></span>
                <strong>{money(q.amount, q.currency)}</strong>
              </label>))}
              {recommended && !quoteId && <p className="text-sm text-muted-foreground">Recommended: {recommended.courierName} ({money(recommended.amount, recommended.currency)}) — select it or another quote to approve.</p>}
              <div className="flex flex-wrap gap-2 pt-2"><button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={!quoteId || approve.isPending || awaitingCustomer} onClick={() => approve.mutate()}>{customerSelected ? 'Approve customer selection' : 'Approve & create delivery'}</button><button className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={sendPaymentLink.isPending || awaitingCustomer || (!customerSelected && !data.deliveryId)} onClick={() => sendPaymentLink.mutate()}>{paymentLinkSent ? 'Resend payment link in chat' : 'Send payment link in chat'}</button>
              <button className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive" onClick={() => reject.mutate()}>Reject</button></div>
              <p className="text-xs text-muted-foreground">When the customer replies with an option number, Dispatchly automatically creates the delivery/checkout and texts the payment link to them in WhatsApp. Owner approval remains available as a manual fallback. Shipbubble booking happens only after payment completes.</p>
            </div> : <p className="text-sm text-muted-foreground">No quotes yet. Complete missing fields, then fetch quotes.</p>}
            {data.deliveryId && <p className="mt-3 text-sm">Delivery record: <a className="text-primary underline" href={`/deliveries/${data.deliveryId}`}>{data.deliveryId}</a></p>}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">Send quote to customer on WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-foreground">This numbered message is exactly what the customer receives. They reply with only the option number (e.g. <strong>1</strong>); Dispatchly AI records their selection on this draft for owner approval.</p>
            <textarea className="mt-3 w-full whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm" rows={12} value={offer.isLoading ? 'Loading quote message...' : quoteMessage} onChange={(e) => setQuoteMessage(e.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={!data.quotes?.length || sendQuote.isPending || !data.conversationId} onClick={() => sendQuote.mutate()}>{awaitingCustomer ? 'Resend quote to customer' : 'Send quote to customer'}</button>
              <button className="rounded-md border px-4 py-2 text-sm" disabled={!offer.data?.message} onClick={() => setQuoteMessage(offer.data?.message ?? '')}>Reset message</button>
            </div>
            {!data.conversationId && <p className="mt-2 text-sm text-amber-600">This draft is not linked to a WhatsApp conversation, so there is no customer to send to.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
