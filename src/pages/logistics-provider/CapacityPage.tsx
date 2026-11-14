import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Copy, Layers, Pause, Play, Plus, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/shared';
import { fmtDate, logisticsProviderApi, naira, titleCase, type AnyRecord } from '@/lib/logistics-provider-api';

const empty = { title: '', region: 'Lagos', state: 'Lagos', city: 'Lagos', pickupZones: '', destinationZones: '', totalCapacity: 100, unit: 'PACKAGES', maxWeightKg: '', maxDimensions: '', deliveryDate: '', pickupStartTime: '08:00', pickupEndTime: '12:00', deliveryTimeframe: 'Same day', priceNaira: 1000, minReservationQty: 1, maxReservationQty: '', reservationDeadline: '', cancellationPolicy: '', instructions: '', recurrence: '' };

export default function LogisticsCapacityPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const q = useQuery({ queryKey: ['lp-capacity'], queryFn: logisticsProviderApi.capacity });
  const zones = useQuery({ queryKey: ['lp-zones'], queryFn: logisticsProviderApi.zones });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['lp-capacity'] }); qc.invalidateQueries({ queryKey: ['lp-overview'] }); };
  const payload = (status: string) => ({
    title: form.title, region: form.region, state: form.state, city: form.city,
    pickupZones: form.pickupZones.split(',').map((s) => s.trim()).filter(Boolean),
    destinationZones: form.destinationZones.split(',').map((s) => s.trim()).filter(Boolean),
    totalCapacity: Number(form.totalCapacity), unit: form.unit, maxWeightKg: form.maxWeightKg ? Number(form.maxWeightKg) : undefined, maxDimensions: form.maxDimensions || undefined,
    deliveryDate: new Date(form.deliveryDate).toISOString(), pickupStartTime: form.pickupStartTime, pickupEndTime: form.pickupEndTime,
    deliveryTimeframe: form.deliveryTimeframe, pricePerPackageKobo: Math.round(Number(form.priceNaira) * 100),
    minReservationQty: Number(form.minReservationQty), maxReservationQty: form.maxReservationQty ? Number(form.maxReservationQty) : undefined,
    reservationDeadline: form.reservationDeadline ? new Date(form.reservationDeadline).toISOString() : undefined,
    cancellationPolicy: form.cancellationPolicy || undefined, instructions: form.instructions || undefined,
    isRecurring: Boolean(form.recurrence), recurrence: form.recurrence || undefined, status,
  });
  const save = useMutation({
    mutationFn: (status: string) => (editing ? logisticsProviderApi.updateCapacity(editing, payload(status)) : logisticsProviderApi.createCapacity(payload(status))),
    onSuccess: () => { toast.success('Capacity saved'); setForm(empty); setEditing(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const act = useMutation({ mutationFn: ({ id, action }: { id: string; action: string }) => logisticsProviderApi.capacityAction(id, action), onSuccess: () => { toast.success('Capacity updated'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const dup = useMutation({ mutationFn: logisticsProviderApi.duplicateCapacity, onSuccess: () => { toast.success('Duplicated as draft'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const field = (label: string, key: keyof typeof empty, type = 'text', placeholder?: string) => (
    <div className="space-y-2"><Label>{label}</Label><Input type={type} value={String(form[key])} placeholder={placeholder} onChange={(e) => set(key, e.target.value)} /></div>
  );
  if (q.isLoading) return <LoadingState text="Loading capacity..." />;
  return (
    <div className="space-y-6">
      <PageHeader title="Capacity management" description="Publish delivery capacity for businesses to reserve. Available = total − confirmed reserved." />
      <Card><CardHeader><CardTitle className="text-base">{editing ? 'Edit capacity window' : 'Publish delivery capacity'}</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {field('Capacity title', 'title', 'text', 'e.g. Lagos same-day bike run')}
          <div className="space-y-2"><Label>Delivery zone (coverage)</Label><Select onValueChange={(v) => { const z = (zones.data ?? []).find((x: AnyRecord) => x.id === v); if (z) setForm((f) => ({ ...f, region: z.region, state: z.state, city: z.city, pickupZones: z.pickupLocation, destinationZones: (z.supportedDestinations ?? []).join(', ') })); }}><SelectTrigger><SelectValue placeholder="Pick a configured zone" /></SelectTrigger><SelectContent>{(zones.data ?? []).map((z: AnyRecord) => <SelectItem key={z.id} value={z.id}>{z.name} — {z.city}</SelectItem>)}</SelectContent></Select></div>
          {field('Region', 'region')}{field('State', 'state')}{field('City', 'city')}
          {field('Pickup zones (comma separated)', 'pickupZones', 'text', 'Yaba, Ikeja')}
          {field('Supported destination zones', 'destinationZones', 'text', 'Ikeja, Lekki')}
          {field('Available quantity', 'totalCapacity', 'number')}
          <div className="space-y-2"><Label>Unit of capacity</Label><Select value={form.unit} onValueChange={(v) => set('unit', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PACKAGES">Packages</SelectItem><SelectItem value="PARCELS">Parcels</SelectItem><SelectItem value="SLOTS">Slots</SelectItem></SelectContent></Select></div>
          {field('Maximum package weight (kg)', 'maxWeightKg', 'number')}
          {field('Maximum dimensions', 'maxDimensions', 'text', '40×40×40cm')}
          {field('Delivery date', 'deliveryDate', 'date')}
          {field('Pickup start time', 'pickupStartTime', 'time')}{field('Pickup end time', 'pickupEndTime', 'time')}
          {field('Expected delivery timeframe', 'deliveryTimeframe')}
          {field('Price per package (₦)', 'priceNaira', 'number')}
          {field('Minimum reservation quantity', 'minReservationQty', 'number')}
          {field('Maximum reservation per business', 'maxReservationQty', 'number')}
          {field('Reservation deadline', 'reservationDeadline', 'datetime-local')}
          {field('Recurrence (optional)', 'recurrence', 'text', 'WEEKLY')}
          {field('Cancellation policy', 'cancellationPolicy')}
          {field('Additional delivery instructions', 'instructions')}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={save.isPending || !form.title || !form.deliveryDate} onClick={() => save.mutate('DRAFT')} variant="outline"><Plus className="mr-2 h-4 w-4" />Save draft</Button>
          <Button disabled={save.isPending || !form.title || !form.deliveryDate} onClick={() => save.mutate('PUBLISHED')}>Publish capacity</Button>
          {editing && <Button variant="ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancel edit</Button>}
        </div>
      </CardContent></Card>
      {(q.data ?? []).length === 0 ? <EmptyState icon={Layers} title="No capacity yet" description="Publish your first capacity window above." /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(q.data ?? []).map((c: AnyRecord) => (
          <Card key={c.id}><CardHeader><CardTitle className="flex items-center justify-between text-base">{c.title}<StatusBadge status={titleCase(c.status)} /></CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{fmtDate(c.deliveryDate)} · {c.city}, {c.state} · {c.pickupStartTime}–{c.pickupEndTime} · {naira(c.pricePerPackageKobo)}/package</p>
            <Progress value={c.totalCapacity ? (c.reservedCapacity / c.totalCapacity) * 100 : 0} />
            <p>{c.availableCapacity} of {c.totalCapacity} available · {c.reservedCapacity} reserved</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(c.id); setForm({ ...empty, title: c.title, region: c.region, state: c.state, city: c.city, pickupZones: (c.pickupZones ?? []).join(', '), destinationZones: (c.destinationZones ?? []).join(', '), totalCapacity: c.totalCapacity, unit: c.unit, deliveryDate: String(c.deliveryDate).slice(0, 10), pickupStartTime: c.pickupStartTime, pickupEndTime: c.pickupEndTime, deliveryTimeframe: c.deliveryTimeframe, priceNaira: c.pricePerPackageKobo / 100, minReservationQty: c.minReservationQty }); }}>Edit</Button>
              {c.status === 'DRAFT' && <Button size="sm" onClick={() => act.mutate({ id: c.id, action: 'PUBLISH' })}>Publish</Button>}
              {c.status === 'PUBLISHED' && <Button size="sm" variant="outline" onClick={() => act.mutate({ id: c.id, action: 'PAUSE' })}><Pause className="mr-1 h-3 w-3" />Pause</Button>}
              {c.status === 'PAUSED' && <Button size="sm" variant="outline" onClick={() => act.mutate({ id: c.id, action: 'RESUME' })}><Play className="mr-1 h-3 w-3" />Resume</Button>}
              <Button size="sm" variant="outline" onClick={() => dup.mutate(c.id)}><Copy className="mr-1 h-3 w-3" />Duplicate</Button>
              {!['CANCELLED', 'EXPIRED'].includes(c.status) && <Button size="sm" variant="outline" onClick={() => { if (confirm('Cancel this capacity window?')) act.mutate({ id: c.id, action: 'CANCEL' }); }}><XCircle className="mr-1 h-3 w-3" />Cancel</Button>}
            </div>
          </CardContent></Card>))}
        </div>)}
    </div>
  );
}
