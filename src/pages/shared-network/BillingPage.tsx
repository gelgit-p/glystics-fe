import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sharedNetworkApi, paidPlans, naira, fmtDate, type AnyRecord } from '@/lib/shared-network-api';
export default function SNBillingPage() {
  const qc = useQueryClient();
  const b = useQuery({ queryKey: ['sn-billing'], queryFn: sharedNetworkApi.billing });
  const plans = useQuery({ queryKey: ['sn-plans'], queryFn: sharedNetworkApi.plans });
  const ref = new URLSearchParams(window.location.search).get('reference') ?? localStorage.getItem('sn-sub-ref');
  const verify = useMutation({ mutationFn: (r: string) => sharedNetworkApi.verifySubscription(r), onSuccess: (r: AnyRecord) => { if (r.status === 'ACTIVE') { toast.success('Subscription active'); localStorage.removeItem('sn-sub-ref'); qc.invalidateQueries({ queryKey: ['sn-billing'] }); } }, onError: (e: Error) => toast.error(e.message) });
  useEffect(() => { if (ref && !verify.isSuccess) verify.mutate(ref); /* eslint-disable-next-line */ }, [ref]);
  const subscribe = useMutation({ mutationFn: (p: AnyRecord) => sharedNetworkApi.createSubscription({ planId: p.id, billingCycle: 'MONTHLY' }), onSuccess: (r: AnyRecord) => { if (r.checkoutUrl) { localStorage.setItem('sn-sub-ref', r.subscription.paymentReference); window.location.href = r.checkoutUrl; } else { toast.success('Plan activated'); qc.invalidateQueries({ queryKey: ['sn-billing'] }); } }, onError: (e: Error) => toast.error(e.message) });
  const cancel = useMutation({ mutationFn: sharedNetworkApi.cancelSubscription, onSuccess: () => { toast.success('Will cancel at period end'); qc.invalidateQueries({ queryKey: ['sn-billing'] }); } });
  return <div className="space-y-6">
    <Card><CardHeader><CardTitle>Current subscription</CardTitle></CardHeader><CardContent className="text-sm space-y-2"><p>{b.data?.subscription ? <><strong>{b.data.subscription.plan.name}</strong> · {b.data.subscription.status} · {b.data.subscription.billingCycle}{b.data.subscription.currentPeriodEnd ? ` · renews/ends ${fmtDate(b.data.subscription.currentPeriodEnd)}` : ''}</> : 'No active subscription — choose a paid plan below'}</p><p>Monthly expenditure: <strong>{naira(b.data?.monthlyExpenditureKobo)}</strong> · Credits balance: <strong>{b.data?.wallet?.balance ?? 0}</strong></p>{b.data?.subscription?.status === 'ACTIVE' && <Button variant="outline" size="sm" onClick={() => cancel.mutate()}>Cancel at period end</Button>}</CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{paidPlans(plans.data).map((p) => <Card key={p.id}><CardHeader><CardTitle className="text-base">{p.name}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="text-2xl font-bold">{naira(p.monthlyPriceKobo)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p><p>{p.monthlyDeliveryVolume} deliveries · {p.reservedCapacityAllowance} reserved · {p.maxActiveSlots} slots · {p.discountPercent}% off pooling</p><p className="text-muted-foreground">{p.analyticsAccess ? 'Analytics · ' : ''}{p.aiDispatchAccess ? 'AI dispatch · ' : ''}{p.priorityAllocation ? 'Priority allocation' : ''}</p><Button className="w-full" variant={b.data?.subscription?.plan?.id === p.id ? 'outline' : 'default'} disabled={subscribe.isPending} onClick={() => { if (confirm(`Subscribe to ${p.name} for ${naira(p.monthlyPriceKobo)}/month?`)) subscribe.mutate(p); }}>{b.data?.subscription?.plan?.id === p.id ? 'Current plan' : 'Subscribe / switch'}</Button></CardContent></Card>)}</div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Transactions</CardTitle></CardHeader><CardContent>{(b.data?.transactions ?? []).map((t: AnyRecord) => <div key={t.id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{t.description}</span><span>{naira(t.amountKobo)} · {t.status}</span></div>)}{(b.data?.transactions ?? []).length === 0 && <p className="text-sm text-muted-foreground">No billing transactions yet.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Invoices</CardTitle></CardHeader><CardContent>{(b.data?.invoices ?? []).map((i: AnyRecord) => <div key={i.id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{i.number}</span><span>{naira(i.amountKobo)} · {i.status} · {fmtDate(i.createdAt)}</span></div>)}{(b.data?.invoices ?? []).length === 0 && <p className="text-sm text-muted-foreground">No invoices yet.</p>}</CardContent></Card>
    </div>
  </div>;
}
