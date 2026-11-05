import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sharedNetworkApi, naira, fmtDate, type AnyRecord} from '@/lib/shared-network-api';
import { LoadingState } from '@/components/shared';

export default function SNOverviewPage() {
  const a = useQuery({ queryKey: ['sn-analytics'], queryFn: sharedNetworkApi.analytics });
  const b = useQuery({ queryKey: ['sn-billing'], queryFn: sharedNetworkApi.billing });
  const s = useQuery({ queryKey: ['sn-slots'], queryFn: sharedNetworkApi.slots });
  const r = useQuery({ queryKey: ['sn-reservations'], queryFn: sharedNetworkApi.reservations });
  if (a.isLoading || b.isLoading) return <LoadingState text="Loading network overview..." />;
  if (a.isError) return <p className="text-sm text-destructive">{(a.error as Error).message}</p>;
  const stats = [
    ['Active subscription', b.data?.subscription?.plan?.name ?? 'No subscription'], ['Billing credits', String(b.data?.balance ?? b.data?.billingWallet?.balance ?? b.data?.wallet?.balance ?? 0)],
    ['Reserved capacity', String(a.data?.reservedCapacity ?? 0)], ['Used capacity', String(a.data?.usedCapacity ?? 0)],
    ['Active pools', String(a.data?.activePools ?? 0)], ['Pooled deliveries', String(a.data?.pooledDeliveries ?? 0)],
    ['Estimated savings', naira(a.data?.estimatedSavingsKobo)], ['Monthly expenditure', naira(a.data?.monthlyExpenditureKobo)],
    ['Total deliveries', String(a.data?.totalDeliveries ?? 0)], ['Upcoming slots', String((s.data ?? []).filter((x: AnyRecord) => x.status === 'BOOKED').length)],
  ];
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{stats.map(([l, v]) => <Card key={l}><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{l}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{v}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Upcoming reservations</CardTitle></CardHeader><CardContent>{(r.data ?? []).slice(0, 5).map((x: AnyRecord) => <div key={x.id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{x.quantity} slots · {x.capacity?.region} · {x.capacity?.window}</span><span className="text-muted-foreground">{fmtDate(x.capacity?.date)} · {x.status}</span></div>)}{(r.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No reservations yet. <Link className="underline" to="/shared-network/capacity">Reserve capacity</Link></p>}</CardContent></Card>
  </div>;
}
