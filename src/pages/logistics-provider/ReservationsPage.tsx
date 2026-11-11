import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/shared';
import { fmtDate, logisticsProviderApi, naira, titleCase, type AnyRecord } from '@/lib/logistics-provider-api';

export default function LogisticsReservationsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const q = useQuery({ queryKey: ['lp-reservations'], queryFn: logisticsProviderApi.reservations });
  const detail = useQuery({ queryKey: ['lp-reservation', selectedId], queryFn: () => logisticsProviderApi.reservation(selectedId!), enabled: Boolean(selectedId) });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['lp-reservations'] }); qc.invalidateQueries({ queryKey: ['lp-overview'] }); qc.invalidateQueries({ queryKey: ['lp-capacity'] }); };
  const act = useMutation({ mutationFn: ({ id, action }: { id: string; action: string }) => logisticsProviderApi.reservationAction(id, { action, reason: action === 'REJECT' ? prompt('Reason for rejection') || undefined : undefined }), onSuccess: () => { toast.success('Reservation updated'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const markPaid = useMutation({ mutationFn: logisticsProviderApi.markPaid, onSuccess: () => { toast.success('Payment confirmed'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  if (q.isLoading) return <LoadingState text="Loading reservations..." />;
  const rows = (q.data ?? []).filter((r: AnyRecord) => filter === 'ALL' || r.status === filter);
  return (
    <div className="space-y-6">
      <PageHeader title="Reservations" description="Reservations businesses made against your published capacity. Only paid reservations can be accepted.">
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>
          {['ALL', 'PENDING', 'AWAITING_PAYMENT', 'CONFIRMED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED'].map((s) => <SelectItem key={s} value={s}>{s === 'ALL' ? 'All statuses' : titleCase(s)}</SelectItem>)}
        </SelectContent></Select>
      </PageHeader>
      {rows.length === 0 ? <EmptyState icon={CalendarCheck} title="No reservations" description="When businesses reserve your capacity, they appear here." /> : (
        <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Reference</th><th className="p-3">Business</th><th className="p-3">Capacity</th><th className="p-3">Pickup → Destination</th><th className="p-3">Packages</th><th className="p-3">Amount</th><th className="p-3">Reserved</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>{rows.map((r: AnyRecord) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{r.reference}</td><td className="p-3">{r.businessName}</td><td className="p-3">{r.capacity?.title}</td>
              <td className="p-3">{r.pickupLocation} → {r.destinationZone}</td><td className="p-3">{r.quantity}</td><td className="p-3">{naira(r.amountKobo)}</td>
              <td className="p-3">{fmtDate(r.createdAt)}</td><td className="p-3"><StatusBadge status={titleCase(r.paymentStatus)} /></td><td className="p-3"><StatusBadge status={titleCase(r.status)} /></td>
              <td className="p-3"><div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => setSelectedId(r.id)}>View</Button>
                {r.paymentStatus !== 'PAID' && ['PENDING', 'AWAITING_PAYMENT'].includes(r.status) && <Button size="sm" variant="outline" onClick={() => markPaid.mutate(r.id)}>Confirm payment</Button>}
                {r.status === 'CONFIRMED' && <Button size="sm" onClick={() => act.mutate({ id: r.id, action: 'ACCEPT' })}>Accept</Button>}
                {['PENDING', 'AWAITING_PAYMENT', 'CONFIRMED'].includes(r.status) && <Button size="sm" variant="outline" onClick={() => act.mutate({ id: r.id, action: 'REJECT' })}>Reject</Button>}
                {r.status === 'ACCEPTED' && <Button size="sm" onClick={() => act.mutate({ id: r.id, action: 'START' })}>Start fulfilment</Button>}
                {r.status === 'IN_PROGRESS' && <Button size="sm" onClick={() => act.mutate({ id: r.id, action: 'COMPLETE' })}>Complete</Button>}
              </div></td>
            </tr>))}
          </tbody></table></div></CardContent></Card>)}
      {detail.data && (
        <Card><CardHeader><CardTitle className="text-base">Reservation {detail.data.reference}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          <p><span className="text-muted-foreground">Business:</span> {detail.data.businessName} · <span className="text-muted-foreground">Packages:</span> {detail.data.quantity} · <span className="text-muted-foreground">Amount:</span> {naira(detail.data.amountKobo)} ({detail.data.paymentStatus})</p>
          <p><span className="text-muted-foreground">Capacity:</span> {detail.data.capacity?.title} · {fmtDate(detail.data.capacity?.deliveryDate)} · <span className="text-muted-foreground">Pickup:</span> {detail.data.pickupLocation} → {detail.data.destinationZone}</p>
          {detail.data.specialInstructions && <p><span className="text-muted-foreground">Special instructions:</span> {detail.data.specialInstructions}</p>}
          {detail.data.rejectReason && <p><span className="text-muted-foreground">Reject reason:</span> {detail.data.rejectReason}</p>}
          <div><p className="mb-1 font-medium">Associated shipments</p>{(detail.data.shipments ?? []).map((s: AnyRecord) => <p key={s.id} className="text-muted-foreground">{s.reference} · {s.receiverName} · {titleCase(s.status)}</p>)}{(detail.data.shipments ?? []).length === 0 && <p className="text-muted-foreground">None yet — create one from Shipments.</p>}</div>
          <div><p className="mb-1 font-medium">Timeline</p>{(detail.data.events ?? []).map((e: AnyRecord) => <p key={e.id} className="text-muted-foreground">{fmtDate(e.createdAt)} · {titleCase(e.status)}{e.note ? ` — ${e.note}` : ''}</p>)}</div>
          <p className="text-muted-foreground">Need to contact the business? Use WhatsApp from the main dashboard — conversations stay in the existing inbox.</p>
        </CardContent></Card>)}
    </div>
  );
}
