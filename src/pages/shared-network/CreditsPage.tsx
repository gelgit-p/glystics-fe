import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sharedNetworkApi, naira, fmtDate, type AnyRecord} from '@/lib/shared-network-api';
export default function SNCreditsPage() {
  const qc = useQueryClient(); const [credits, setCredits] = useState(100);
  const q = useQuery({ queryKey: ['sn-credits'], queryFn: sharedNetworkApi.credits });
  const params = new URLSearchParams(window.location.search); const ref = params.get('reference') ?? localStorage.getItem('sn-credit-ref');
  const verify = useMutation({ mutationFn: (r: string) => sharedNetworkApi.verifyCredits(r), onSuccess: (r: AnyRecord) => { if (r.status === 'PAID') { toast.success(r.credited ? 'Credits added to your Shared Network wallet' : 'Payment already credited'); localStorage.removeItem('sn-credit-ref'); qc.invalidateQueries({ queryKey: ['sn-credits'] }); qc.invalidateQueries({ queryKey: ['sn-business'] }); } }, onError: (e: Error) => toast.error(e.message) });
  useEffect(() => { if (ref && !verify.isPending && !verify.isSuccess) verify.mutate(ref); /* eslint-disable-next-line */ }, [ref]);
  const buy = useMutation({ mutationFn: () => sharedNetworkApi.purchaseCredits(credits), onSuccess: (r: AnyRecord) => { localStorage.setItem('sn-credit-ref', r.purchase.paymentReference); window.location.href = r.checkoutUrl; }, onError: (e: Error) => toast.error(e.message) });
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3">{[['Available credits', q.data?.wallet?.balance ?? 0], ['Lifetime purchased', q.data?.wallet?.lifetimePurchased ?? 0], ['Lifetime spent', q.data?.wallet?.lifetimeSpent ?? 0]].map(([l, v]) => <Card key={l as string}><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">{l}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{v}</p></CardContent></Card>)}</div>
    <p className="text-sm text-muted-foreground">Shared Network credits are separate from Dispatchly delivery/notification credits and can only pay for network capacity and services. Never negative, always server-verified.</p>
    <Card><CardHeader><CardTitle>Buy Shared Network credits</CardTitle></CardHeader><CardContent className="flex flex-wrap items-end gap-3"><div className="space-y-2"><Label>Credits ({naira(q.data?.priceKoboPerCredit)} each)</Label><Input type="number" min={1} value={credits} onChange={(e) => setCredits(Number(e.target.value))} /></div><p className="text-sm">Total: <strong>{naira(credits * (q.data?.priceKoboPerCredit ?? 100))}</strong></p><Button disabled={buy.isPending} onClick={() => { if (confirm(`Buy ${credits} Shared Network credits for ${naira(credits * (q.data?.priceKoboPerCredit ?? 100))} via secure checkout?`)) buy.mutate(); }}>Buy credits</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Credit history</CardTitle></CardHeader><CardContent>{(q.data?.transactions ?? []).map((t: AnyRecord) => <div key={t.id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{t.description}</span><span className={t.amount > 0 ? 'text-emerald-600' : ''}>{t.amount > 0 ? '+' : ''}{t.amount} · bal {t.balanceAfter} · {fmtDate(t.createdAt)}</span></div>)}{(q.data?.transactions ?? []).length === 0 && <p className="text-sm text-muted-foreground">No credit transactions yet.</p>}</CardContent></Card>
  </div>;
}
