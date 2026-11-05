import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sharedNetworkApi, naira, type AnyRecord} from '@/lib/shared-network-api';
import { LoadingState } from '@/components/shared';

const split = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
export default function SNJoinPage() {
  const nav = useNavigate();
  const plans = useQuery({ queryKey: ['sn-plans'], queryFn: sharedNetworkApi.plans });
  const existing = useQuery({ queryKey: ['sn-business'], queryFn: sharedNetworkApi.business });
  const [f, setF] = useState({ businessName: '', businessEmail: '', contactPhone: '', category: 'Online retail', pickupLocations: '', operatingRegions: 'Lagos', expectedDailyVolume: 10, expectedWeeklyVolume: 60, preferredWindows: 'MORNING, AFTERNOON', planId: '', billingCycle: 'PAY_AS_YOU_GO' });
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  const mut = useMutation({
    mutationFn: () => sharedNetworkApi.createBusiness({ businessName: f.businessName, businessEmail: f.businessEmail, contactPhone: f.contactPhone, category: f.category, pickupLocations: split(f.pickupLocations), operatingRegions: split(f.operatingRegions), expectedDailyVolume: Number(f.expectedDailyVolume), expectedWeeklyVolume: Number(f.expectedWeeklyVolume), preferredWindows: split(f.preferredWindows), planId: f.planId || undefined, billingCycle: f.billingCycle }),
    onSuccess: (r: AnyRecord) => { if (r?.subscription?.checkoutUrl) { window.location.href = r.subscription.checkoutUrl; return; } toast.success('Welcome to the Shared Delivery Network'); nav('/shared-network'); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (plans.isLoading || existing.isLoading) return <LoadingState text="Loading plans..." />;
  if (existing.data) { nav('/shared-network'); return null; }
  return <div className="mx-auto max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-bold">Join the Shared Delivery Network</h1><p className="text-muted-foreground">One delivery network. Multiple businesses. Smarter logistics. Existing Dispatchly accounts activate instantly — no second account.</p></div>
    <Card><CardHeader><CardTitle>Business information</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
      {([['Business name', 'businessName', 'text'], ['Business email', 'businessEmail', 'email'], ['Contact phone', 'contactPhone', 'tel'], ['Business category', 'category', 'text'], ['Pickup locations (comma separated)', 'pickupLocations', 'text'], ['Operating regions (comma separated)', 'operatingRegions', 'text']] as const).map(([l, k, t]) => <div key={k} className="space-y-2"><Label>{l}</Label><Input type={t} value={(f as AnyRecord)[k]} onChange={(e) => set(k, e.target.value)} required /></div>)}
      <div className="space-y-2"><Label>Expected daily volume</Label><Input type="number" min={0} value={f.expectedDailyVolume} onChange={(e) => set('expectedDailyVolume', e.target.value)} /></div>
      <div className="space-y-2"><Label>Expected weekly volume</Label><Input type="number" min={0} value={f.expectedWeeklyVolume} onChange={(e) => set('expectedWeeklyVolume', e.target.value)} /></div>
      <div className="space-y-2 sm:col-span-2"><Label>Preferred delivery windows</Label><Input value={f.preferredWindows} onChange={(e) => set('preferredWindows', e.target.value)} /></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Subscription plan</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">
      <button type="button" onClick={() => { set('planId', ''); set('billingCycle', 'PAY_AS_YOU_GO'); }} className={`rounded-lg border p-4 text-left ${f.billingCycle === 'PAY_AS_YOU_GO' ? 'border-primary ring-1 ring-primary' : ''}`}><p className="font-semibold">Pay as you go</p><p className="text-sm text-muted-foreground">No subscription. Buy credits and reserve capacity as needed.</p></button>
      {(plans.data ?? []).map((p) => <button key={p.id} type="button" onClick={() => { set('planId', p.id); set('billingCycle', 'MONTHLY'); }} className={`rounded-lg border p-4 text-left ${f.planId === p.id ? 'border-primary ring-1 ring-primary' : ''}`}><p className="font-semibold">{p.name}</p><p className="text-sm">{p.monthlyPriceKobo ? `${naira(p.monthlyPriceKobo)}/mo` : 'Free / custom'} · {p.monthlyDeliveryVolume} deliveries · {p.discountPercent}% pooling discount</p><p className="text-sm text-muted-foreground">{p.description}</p></button>)}
      {f.planId && <div className="flex gap-2 sm:col-span-2">{(['MONTHLY', 'ANNUAL'] as const).map((c) => <Button key={c} type="button" variant={f.billingCycle === c ? 'default' : 'outline'} onClick={() => set('billingCycle', c)}>{c}</Button>)}</div>}
    </CardContent></Card>
    <Button className="w-full" disabled={mut.isPending || !f.businessName || !f.businessEmail} onClick={() => mut.mutate()}>{mut.isPending ? 'Activating...' : 'Activate Shared Delivery Network'}</Button>
    <p className="text-center text-sm text-muted-foreground">Paid plans open secure Bachs checkout. <Link to="/shared-network-info" className="underline">Learn more</Link></p>
  </div>;
}
