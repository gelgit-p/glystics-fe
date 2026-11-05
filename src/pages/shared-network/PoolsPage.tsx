import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { sharedNetworkApi, naira, fmtDate } from '@/lib/shared-network-api';
import { Hint } from '@/components/ui/hint';

export default function SNPoolsPage() {
  const qc = useQueryClient(); const [region, setRegion] = useState('Lagos'); const [pickup, setPickup] = useState(''); const [qty, setQty] = useState(1);
  const q = useQuery({ queryKey: ['sn-pools', region], queryFn: () => sharedNetworkApi.pools(region) });
  const inv = () => qc.invalidateQueries({ queryKey: ['sn-pools'] });
  const join = useMutation({ mutationFn: (id: string) => sharedNetworkApi.joinPool(id, { pickupAddress: pickup || region, destinationRegion: region, quantity: qty }), onSuccess: () => { toast.success('Joined pool'); inv(); }, onError: (e: Error) => toast.error(e.message) });
  const leave = useMutation({ mutationFn: sharedNetworkApi.leavePool, onSuccess: () => { toast.success('Left pool'); inv(); }, onError: (e: Error) => toast.error(e.message) });
  const create = useMutation({ mutationFn: () => sharedNetworkApi.createPool({ region, date: new Date().toISOString().slice(0, 10), window: 'AFTERNOON' }), onSuccess: () => { toast.success('Pool created'); inv(); }, onError: (e: Error) => toast.error(e.message) });
  return <div className="space-y-6">
    <Card><CardHeader><CardTitle>Shared delivery pools</CardTitle></CardHeader><CardContent className="flex flex-wrap items-end gap-3">
      <div className="space-y-2"><Label>Region</Label><Input value={region} onChange={(e) => setRegion(e.target.value)} /></div>
      <div className="space-y-2"><Label>Your pickup address</Label><Input value={pickup} onChange={(e) => setPickup(e.target.value)} /></div>
      <div className="space-y-2"><Label>Deliveries</Label><Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-24" /></div>
      <Hint label="Creates an open pool for this region today (afternoon window). Other businesses can join it; they never see your customers or addresses"><Button variant="outline" onClick={() => create.mutate()}>Start a pool</Button></Hint>
      <p className="w-full text-xs text-muted-foreground">Privacy: you only ever see your own deliveries in a pool. Courier, counts and savings are shared — never other businesses' customers, addresses or orders.</p>
    </CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(q.data ?? []).map((p) => <Card key={p.id}><CardHeader><CardTitle className="text-base">{p.name}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
      <p>{fmtDate(p.date)} · {p.window} · {p.status}</p><Progress value={p.maxDeliveries ? (p.totalDeliveries / p.maxDeliveries) * 100 : 0} />
      <p>{p.totalDeliveries}/{p.maxDeliveries} deliveries · {p.businessCount} businesses · est. savings {naira(p.estimatedSavingsKobo)}</p>
      {p.courierName && <p className="text-muted-foreground">Courier: {p.courierName}</p>}
      {p.myDeliveries.length > 0 ? <><p>Your deliveries in pool: {p.myDeliveries.reduce((s, d) => s + d.quantity, 0)} (~{naira(p.myDeliveries.reduce((s, d) => s + d.estimatedCostKobo, 0))})</p><Hint label="Removes your deliveries from this pool (allowed before the pool cut-off)"><Button size="sm" variant="outline" onClick={() => leave.mutate(p.id)}>Leave pool</Button></Hint></> : <Hint label={p.status !== 'OPEN' ? 'This pool is no longer open for new deliveries' : 'Adds your deliveries to this shared route. You only pay your estimated pooled cost; other businesses stay private'}><Button size="sm" disabled={p.status !== 'OPEN'} onClick={() => join.mutate(p.id)}>Join pool</Button></Hint>}
    </CardContent></Card>)}</div>
    {(q.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No open pools in {region}. Start one and other businesses can join.</p>}
  </div>;
}
