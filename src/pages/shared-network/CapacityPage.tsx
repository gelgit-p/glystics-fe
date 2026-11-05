import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { sharedNetworkApi, fmtDate, type AnyRecord} from '@/lib/shared-network-api';
import { LoadingState } from '@/components/shared';

export default function SNCapacityPage() {
  const qc = useQueryClient();
  const [region, setRegion] = useState('Lagos'); const [qty, setQty] = useState(10); const [pickup, setPickup] = useState('');
  const cap = useQuery({ queryKey: ['sn-capacity', region], queryFn: () => sharedNetworkApi.availableCapacity(region) });
  const res = useQuery({ queryKey: ['sn-reservations'], queryFn: sharedNetworkApi.reservations });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['sn-capacity'] }); qc.invalidateQueries({ queryKey: ['sn-reservations'] }); qc.invalidateQueries({ queryKey: ['sn-business'] }); };
  const reserve = useMutation({ mutationFn: (c: AnyRecord) => sharedNetworkApi.createReservation({ capacityId: c.id, quantity: qty, pickupLocation: pickup || c.region, idempotencyKey: `web-${c.id}-${Date.now()}` }), onSuccess: () => { toast.success('Capacity reserved'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const cancel = useMutation({ mutationFn: sharedNetworkApi.cancelReservation, onSuccess: () => { toast.success('Reservation cancelled and credits refunded'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  if (cap.isLoading) return <LoadingState text="Checking available capacity..." />;
  return <div className="space-y-6">
    <Card><CardHeader><CardTitle>Reserve delivery capacity</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2"><Label>Region</Label><Input value={region} onChange={(e) => setRegion(e.target.value)} /></div>
      <div className="space-y-2"><Label>Quantity</Label><Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
      <div className="space-y-2"><Label>Pickup location</Label><Input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="e.g. Yaba, Lagos" /></div>
    </CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(cap.data ?? []).map((c) => <Card key={c.id}><CardHeader><CardTitle className="text-base">{c.region} · {c.window}</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">{fmtDate(c.date)} · {c.vehicleType} · {c.pricePerSlotCredits} credits/slot</p><Progress value={c.totalCapacity ? (c.reservedCapacity / c.totalCapacity) * 100 : 0} /><p className="text-sm">{c.available} of {c.totalCapacity} available</p><Button className="w-full" disabled={c.available < 1 || reserve.isPending} onClick={() => { if (confirm(`Reserve ${qty} slots for ${c.pricePerSlotCredits * qty} credits?`)) reserve.mutate(c); }}>Reserve {qty}</Button></CardContent></Card>)}
    {(cap.data ?? []).length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No capacity published for {region} yet. New windows are added by Dispatchly operations.</CardContent></Card>}</div>
    <Card><CardHeader><CardTitle>My reservations</CardTitle></CardHeader><CardContent>{(res.data ?? []).map((r) => <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-3 text-sm last:border-0"><span>{r.quantity} slots · {r.capacity?.region} {r.capacity?.window} · {fmtDate(r.capacity?.date)} · {r.costCredits} credits</span><span className="flex items-center gap-2"><span className="text-muted-foreground">{r.status}</span>{r.status === 'CONFIRMED' && <Button size="sm" variant="outline" onClick={() => { if (confirm('Cancel this reservation? Credits will be refunded.')) cancel.mutate(r.id); }}>Cancel</Button>}</span></div>)}{(res.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No reservations yet.</p>}</CardContent></Card>
  </div>;
}
