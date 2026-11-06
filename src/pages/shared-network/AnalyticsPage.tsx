import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sharedNetworkApi, naira, fmtDate, type AnyRecord} from '@/lib/shared-network-api';
import { LoadingState } from '@/components/shared';
export default function SNAnalyticsPage() {
  const q = useQuery({ queryKey: ['sn-analytics'], queryFn: sharedNetworkApi.analytics });
  if (q.isLoading) return <LoadingState text="Loading analytics..." />;
  const d = q.data ?? {};
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Estimated shared savings', naira(d.estimatedSavingsKobo)], ['Reserved capacity', d.reservedCapacity ?? 0], ['Pooled deliveries', d.pooledDeliveries ?? 0], ['Total expenditure', naira(d.monthlyExpenditureKobo)]].map(([l, v]) => <Card key={l as string}><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{l}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{v}</p></CardContent></Card>)}</div>
  <Card><CardHeader><CardTitle>Utilization by type</CardTitle></CardHeader><CardContent>{Object.entries(d.usageByType ?? {}).map(([k, v]) => <div key={k} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{k}</span><span>{String(v)}</span></div>)}{Object.keys(d.usageByType ?? {}).length === 0 && <p className="text-sm text-muted-foreground">No usage recorded yet.</p>}</CardContent></Card>
  <Card><CardHeader><CardTitle>Recent usage</CardTitle></CardHeader><CardContent>{(d.recentUsage ?? []).map((u: AnyRecord) => <div key={u.id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{u.type} × {u.quantity}</span><span>{u.costCredits} credits · {naira(u.costKobo)} · {fmtDate(u.createdAt)}</span></div>)}</CardContent></Card></div>;
}
