import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sharedNetworkApi, fmtDate, type AnyRecord } from '@/lib/shared-network-api';
import { Hint } from '@/components/ui/hint';
export default function SNCreditsPage() {
  const q = useQuery({ queryKey: ['sn-credits'], queryFn: sharedNetworkApi.credits });
  const w = q.data?.billingWallet ?? q.data?.wallet;
  const balance = q.data?.balance ?? w?.balance ?? 0;
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3">{[['Billing credits balance', balance], ['Points', w?.points ?? 0], ['Credits used this month', w?.creditsUsedThisMonth ?? 0]].map(([l, v]) => <Card key={l as string}><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{l}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{v}</p></CardContent></Card>)}</div>
    {w?.lowBalance && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Your Billing credits balance is low. Shared Network reservations draw from the same balance.</p>}
    <Card><CardHeader><CardTitle>Credits for the Shared Delivery Network</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
      <p className="text-muted-foreground">Shared Network capacity reservations are paid with the credits in your main <strong>Billing</strong> wallet — the same balance you buy and use for deliveries and WhatsApp notifications. There is no separate Shared Network credit purchase.</p>
      <Hint label="Opens your main Billing page — the same wallet used for deliveries and WhatsApp notifications"><Button asChild><Link to="/billing">Go to Billing to buy credits</Link></Button></Hint>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Shared Network credit usage</CardTitle></CardHeader><CardContent>{(q.data?.transactions ?? []).map((t: AnyRecord) => <div key={t.id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{t.description}</span><span className={t.amount > 0 ? 'text-emerald-600' : ''}>{t.amount > 0 ? '+' : ''}{t.amount} · bal {t.balanceAfter} · {fmtDate(t.createdAt)}</span></div>)}{(q.data?.transactions ?? []).length === 0 && <p className="text-sm text-muted-foreground">No Shared Network credit usage yet. Reserve capacity and it will appear here and in Billing.</p>}</CardContent></Card>
  </div>;
}
