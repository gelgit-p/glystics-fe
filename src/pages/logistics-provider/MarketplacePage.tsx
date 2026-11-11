import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/shared';
import { fmtDate, logisticsMarketplaceApi, naira, titleCase, type AnyRecord } from '@/lib/logistics-provider-api';

// Businesses browse provider-published capacity here and reserve it; the provider then manages it under Reservations.
export default function LogisticsMarketplacePage() {
  const qc = useQueryClient();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [pickup, setPickup] = useState<Record<string, string>>({});
  const browse = useQuery({ queryKey: ['lp-marketplace'], queryFn: logisticsMarketplaceApi.browse });
  const mine = useQuery({ queryKey: ['lp-my-reservations'], queryFn: logisticsMarketplaceApi.mine });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['lp-marketplace'] }); qc.invalidateQueries({ queryKey: ['lp-my-reservations'] }); };
  const reserve = useMutation({ mutationFn: (c: AnyRecord) => logisticsMarketplaceApi.reserve({ capacityId: c.id, quantity: qty[c.id] ?? c.minReservationQty ?? 1, pickupLocation: pickup[c.id] || c.city, destinationZone: (c.destinationZones ?? [])[0] ?? c.city, idempotencyKey: `web-lp-${c.id}-${Date.now()}` }), onSuccess: () => { toast.success('Capacity reserved — the provider has been notified'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const cancel = useMutation({ mutationFn: logisticsMarketplaceApi.cancel, onSuccess: () => { toast.success('Reservation cancelled and capacity released'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  if (browse.isLoading) return <LoadingState text="Loading marketplace capacity..." />;
  return (
    <div className="space-y-6">
      <PageHeader title="Marketplace — reserve provider capacity" description="Published capacity from verified logistics providers on the Dispatchly network." />
      {(browse.data ?? []).length === 0 ? <EmptyState icon={Store} title="No capacity available yet" description="Verified providers have not published bookable capacity for upcoming dates." /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(browse.data ?? []).map((c: AnyRecord) => (
          <Card key={c.id}><CardHeader><CardTitle className="text-base">{c.title}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{c.providerName} · {fmtDate(c.deliveryDate)} · {c.city}, {c.state} · {naira(c.pricePerPackageKobo)}/package</p>
            <Progress value={c.totalCapacity ? (c.reservedCapacity / c.totalCapacity) * 100 : 0} />
            <p>{c.availableCapacity} of {c.totalCapacity} available · destinations: {(c.destinationZones ?? []).join(', ')}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>Quantity</Label><Input type="number" min={c.minReservationQty ?? 1} value={qty[c.id] ?? c.minReservationQty ?? 1} onChange={(e) => setQty({ ...qty, [c.id]: Number(e.target.value) })} /></div>
              <div className="space-y-1"><Label>Pickup location</Label><Input value={pickup[c.id] ?? ''} placeholder={c.city} onChange={(e) => setPickup({ ...pickup, [c.id]: e.target.value })} /></div>
            </div>
            <Button className="w-full" disabled={reserve.isPending} onClick={() => { if (confirm(`Reserve ${qty[c.id] ?? c.minReservationQty ?? 1} packages with ${c.providerName} for ${naira((qty[c.id] ?? 1) * c.pricePerPackageKobo)}?`)) reserve.mutate(c); }}>Reserve capacity</Button>
          </CardContent></Card>))}
        </div>)}
      <Card><CardHeader><CardTitle className="text-base">My marketplace reservations</CardTitle></CardHeader><CardContent className="space-y-3">
        {(mine.data ?? []).map((r: AnyRecord) => <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0"><span>{r.reference} · {r.provider?.companyName ?? ''} · {r.quantity} pkgs · {naira(r.amountKobo)}</span><span className="flex items-center gap-2"><StatusBadge status={titleCase(r.paymentStatus)} /><StatusBadge status={titleCase(r.status)} />{['PENDING', 'AWAITING_PAYMENT', 'CONFIRMED'].includes(r.status) && <Button size="sm" variant="outline" onClick={() => { if (confirm('Cancel this reservation? Capacity will be released.')) cancel.mutate(r.id); }}>Cancel</Button>}</span></div>)}
        {(mine.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No marketplace reservations yet.</p>}
      </CardContent></Card>
    </div>
  );
}
