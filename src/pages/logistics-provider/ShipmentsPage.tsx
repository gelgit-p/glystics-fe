import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/shared';
import { logisticsProviderApi, titleCase, type AnyRecord } from '@/lib/logistics-provider-api';

const STATUSES = ['PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED'];
const empty = { senderName: '', receiverName: '', receiverPhone: '', pickupAddress: '', deliveryAddress: '', packageDescription: '', packageWeightKg: '', packageDimensions: '', deliveryInstructions: '', deliveryId: '' };

export default function LogisticsShipmentsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [reservationId, setReservationId] = useState('');
  const [riderId, setRiderId] = useState('');
  const q = useQuery({ queryKey: ['lp-shipments'], queryFn: logisticsProviderApi.shipments });
  const reservations = useQuery({ queryKey: ['lp-reservations'], queryFn: logisticsProviderApi.reservations });
  const fleet = useQuery({ queryKey: ['lp-fleet'], queryFn: logisticsProviderApi.fleet });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['lp-shipments'] });
  const create = useMutation({ mutationFn: () => logisticsProviderApi.createShipment({ reservationId, riderId: riderId || undefined, deliveryId: form.deliveryId || undefined, senderName: form.senderName, receiverName: form.receiverName, receiverPhone: form.receiverPhone, pickupAddress: form.pickupAddress, deliveryAddress: form.deliveryAddress, packageDescription: form.packageDescription || undefined, packageWeightKg: form.packageWeightKg ? Number(form.packageWeightKg) : undefined, packageDimensions: form.packageDimensions || undefined, deliveryInstructions: form.deliveryInstructions || undefined }), onSuccess: () => { toast.success('Shipment created'); setForm(empty); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const update = useMutation({ mutationFn: ({ id, d }: { id: string; d: AnyRecord }) => logisticsProviderApi.updateShipment(id, d), onSuccess: () => { toast.success('Shipment updated'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const field = (label: string, key: keyof typeof empty, type = 'text') => (<div className="space-y-2"><Label>{label}</Label><Input type={type} value={String(form[key])} onChange={(e) => set(key, e.target.value)} /></div>);
  if (q.isLoading) return <LoadingState text="Loading shipments..." />;
  return (
    <div className="space-y-6">
      <PageHeader title="Shipments" description="Deliveries fulfilling your reservations. Link an existing Dispatchly Delivery instead of duplicating it." />
      <Card><CardHeader><CardTitle className="text-base">Create shipment</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Reservation</Label><Select value={reservationId} onValueChange={setReservationId}><SelectTrigger><SelectValue placeholder="Select reservation" /></SelectTrigger><SelectContent>{(reservations.data ?? []).filter((r: AnyRecord) => ['CONFIRMED', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status)).map((r: AnyRecord) => <SelectItem key={r.id} value={r.id}>{r.reference} — {r.businessName}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Assigned rider (optional)</Label><Select value={riderId} onValueChange={setRiderId}><SelectTrigger><SelectValue placeholder="Select rider" /></SelectTrigger><SelectContent>{(fleet.data?.riders ?? []).map((r: AnyRecord) => <SelectItem key={r.id} value={r.id}>{r.name} ({r.vehicleType})</SelectItem>)}</SelectContent></Select></div>
          {field('Sender name', 'senderName')}{field('Receiver name', 'receiverName')}{field('Receiver phone', 'receiverPhone')}
          {field('Pickup address', 'pickupAddress')}{field('Delivery address', 'deliveryAddress')}
          {field('Package description', 'packageDescription')}{field('Package weight (kg)', 'packageWeightKg', 'number')}
          {field('Package dimensions', 'packageDimensions')}{field('Delivery instructions', 'deliveryInstructions')}
          {field('Existing Delivery ID (optional link)', 'deliveryId')}
        </div>
        <Button disabled={create.isPending || !reservationId || !form.receiverName} onClick={() => create.mutate()}>Create shipment</Button>
      </CardContent></Card>
      {(q.data ?? []).length === 0 ? <EmptyState icon={Package} title="No shipments yet" description="Create a shipment against a confirmed reservation." /> : (
        <div className="grid gap-4 md:grid-cols-2">{(q.data ?? []).map((s: AnyRecord) => (
          <Card key={s.id}><CardHeader><CardTitle className="flex items-center justify-between text-base">{s.reference}<StatusBadge status={titleCase(s.status)} /></CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Reservation {s.reservation?.reference} · {s.reservation?.businessName}</p>
            <p>{s.senderName} → {s.receiverName} ({s.receiverPhone})</p>
            <p className="text-muted-foreground">{s.pickupAddress} → {s.deliveryAddress}</p>
            <p className="text-muted-foreground">Tracking: {s.trackingReference ?? '—'}{s.rider ? ` · Rider: ${s.rider.name}` : ''}{s.packageDescription ? ` · ${s.packageDescription}` : ''}</p>
            {(s.attempts ?? []).length > 0 && <p className="text-muted-foreground">Attempts: {s.attempts.map((a: AnyRecord) => a.note).join('; ')}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              <Select onValueChange={(v) => update.mutate({ id: s.id, d: v === 'FAILED' ? { status: v, attemptNote: prompt('Failed delivery attempt note') || 'Failed attempt' } : { status: v } })}><SelectTrigger className="w-44"><SelectValue placeholder="Update status" /></SelectTrigger><SelectContent>{STATUSES.map((x) => <SelectItem key={x} value={x}>{titleCase(x)}</SelectItem>)}</SelectContent></Select>
              <Select onValueChange={(v) => update.mutate({ id: s.id, d: { riderId: v } })}><SelectTrigger className="w-40"><SelectValue placeholder="Assign rider" /></SelectTrigger><SelectContent>{(fleet.data?.riders ?? []).filter((r: AnyRecord) => r.isAvailable).map((r: AnyRecord) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
              {s.status === 'OUT_FOR_DELIVERY' && <Button size="sm" variant="outline" onClick={() => { const url = prompt('Proof of delivery URL'); if (url) update.mutate({ id: s.id, d: { status: 'DELIVERED', proofOfDeliveryUrl: url, deliveryNote: 'Delivered' } }); }}>Upload proof & deliver</Button>}
            </div>
          </CardContent></Card>))}
        </div>)}
    </div>
  );
}
