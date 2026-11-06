import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sharedNetworkApi, fmtDate, type AnyRecord} from '@/lib/shared-network-api';
import { LoadingState } from '@/components/shared';
export default function SNDeliveriesPage() {
  const q = useQuery({ queryKey: ['sn-deliveries'], queryFn: sharedNetworkApi.deliveries });
  if (q.isLoading) return <LoadingState text="Loading deliveries..." />;
  return <Card><CardHeader><CardTitle>Network deliveries</CardTitle></CardHeader><CardContent>{(q.data ?? []).map((d: AnyRecord) => <div key={d.id} className="flex flex-wrap justify-between gap-2 border-b py-3 text-sm last:border-0"><span><strong>{d.trackingId}</strong> · {d.receiverAddress}</span><span className="text-muted-foreground">{d.deliveryStatus ?? 'Pending'} · {fmtDate(d.createdAt)}{d.pool ? ` · Pool: ${d.pool.name} (${d.pool.status})` : ''}</span></div>)}{(q.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No deliveries yet. Deliveries you create in Dispatchly appear here with their pool status.</p>}</CardContent></Card>;
}
