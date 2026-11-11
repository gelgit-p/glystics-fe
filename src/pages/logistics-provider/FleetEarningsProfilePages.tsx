import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/shared';
import { fmtDate, logisticsProviderApi, naira, titleCase, type AnyRecord } from '@/lib/logistics-provider-api';

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>;
}

export function LogisticsFleetPage() {
  const qc = useQueryClient();
  const [rider, setRider] = useState({ name: '', phoneNumber: '', vehicleType: 'BIKE', vehicleRegistration: '' });
  const [vehicle, setVehicle] = useState({ type: 'BIKE', registration: '', capacityPackages: 20 });
  const q = useQuery({ queryKey: ['lp-fleet'], queryFn: logisticsProviderApi.fleet });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['lp-fleet'] });
  const addRider = useMutation({ mutationFn: () => logisticsProviderApi.createRider(rider), onSuccess: () => { toast.success('Rider added'); setRider({ name: '', phoneNumber: '', vehicleType: 'BIKE', vehicleRegistration: '' }); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const toggleRider = useMutation({ mutationFn: (r: AnyRecord) => logisticsProviderApi.updateRider(r.id, { name: r.name, phoneNumber: r.phoneNumber, vehicleType: r.vehicleType, isAvailable: !r.isAvailable }), onSuccess: invalidate, onError: (e: Error) => toast.error(e.message) });
  const addVehicle = useMutation({ mutationFn: () => logisticsProviderApi.createVehicle({ ...vehicle, capacityPackages: Number(vehicle.capacityPackages) }), onSuccess: () => { toast.success('Vehicle added'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  if (q.isLoading) return <LoadingState text="Loading fleet..." />;
  return (
    <div className="space-y-6">
      <PageHeader title="Rider & fleet management" description="Your riders, vehicles and their assigned shipments." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Add rider</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rider name" value={rider.name} onChange={(v) => setRider({ ...rider, name: v })} />
            <Field label="Phone number" value={rider.phoneNumber} onChange={(v) => setRider({ ...rider, phoneNumber: v })} />
            <Field label="Vehicle type" value={rider.vehicleType} onChange={(v) => setRider({ ...rider, vehicleType: v })} placeholder="BIKE, VAN, CAR" />
            <Field label="Vehicle registration" value={rider.vehicleRegistration} onChange={(v) => setRider({ ...rider, vehicleRegistration: v })} />
          </div>
          <Button disabled={!rider.name || !rider.phoneNumber || addRider.isPending} onClick={() => addRider.mutate()}>Add rider</Button>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Add vehicle</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Type" value={vehicle.type} onChange={(v) => setVehicle({ ...vehicle, type: v })} />
            <Field label="Registration" value={vehicle.registration} onChange={(v) => setVehicle({ ...vehicle, registration: v })} />
            <Field label="Capacity (packages)" type="number" value={String(vehicle.capacityPackages)} onChange={(v) => setVehicle({ ...vehicle, capacityPackages: Number(v) })} />
          </div>
          <Button disabled={!vehicle.registration || addVehicle.isPending} onClick={() => addVehicle.mutate()}>Add vehicle</Button>
        </CardContent></Card>
      </div>
      {(q.data?.riders ?? []).length === 0 && (q.data?.vehicles ?? []).length === 0 ? <EmptyState icon={Users} title="No fleet yet" description="Add riders and vehicles to assign shipments." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Riders</CardTitle></CardHeader><CardContent className="space-y-3">{(q.data?.riders ?? []).map((r: AnyRecord) => <div key={r.id} className="flex items-center justify-between gap-2 text-sm"><span>{r.name} · {r.phoneNumber} · {r.vehicleType}{r.vehicleRegistration ? ` · ${r.vehicleRegistration}` : ''} · {(r.shipments ?? []).length} shipments</span><span className="flex items-center gap-2"><StatusBadge status={r.isAvailable ? 'Active' : 'Inactive'} />Available <Switch checked={r.isAvailable} onCheckedChange={() => toggleRider.mutate(r)} /></span></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Vehicles</CardTitle></CardHeader><CardContent className="space-y-3">{(q.data?.vehicles ?? []).map((v: AnyRecord) => <p key={v.id} className="text-sm">{v.type} · {v.registration} · {v.capacityPackages} packages</p>)}{(q.data?.vehicles ?? []).length === 0 && <p className="text-sm text-muted-foreground">No vehicles.</p>}</CardContent></Card>
        </div>)}
    </div>
  );
}

export function LogisticsEarningsPage() {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const q = useQuery({ queryKey: ['lp-earnings'], queryFn: logisticsProviderApi.earnings });
  const payout = useMutation({ mutationFn: () => logisticsProviderApi.requestPayout({ amountKobo: Math.round(Number(amount) * 100) }), onSuccess: () => { toast.success('Payout requested'); setAmount(''); qc.invalidateQueries({ queryKey: ['lp-earnings'] }); }, onError: (e: Error) => toast.error(e.message) });
  if (q.isLoading) return <LoadingState text="Loading earnings..." />;
  if (!q.data) return <EmptyState icon={Wallet} title="No earnings yet" description="Complete your provider profile first." />;
  const e = q.data;
  const exampleGross = 1000; const exampleCommission = Math.round((exampleGross * e.commissionPercent) / 100);
  return (
    <div className="space-y-6">
      <PageHeader title="Pricing & earnings" description={`Platform commission is ${e.commissionPercent}% (configured by Dispatchly, never hardcoded). Example: ₦${exampleGross.toLocaleString()} delivery → ₦${exampleCommission.toLocaleString()} commission → you earn ₦${(exampleGross - exampleCommission).toLocaleString()}. Per-package and per-zone prices are set on your capacity windows and zones.`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Total revenue', e.totalRevenueKobo], ['Platform commission', e.platformCommissionKobo], ['Total earnings', e.totalEarningsKobo], ['Completed delivery earnings', e.completedDeliveryEarningsKobo], ['Pending earnings', e.pendingEarningsKobo], ['Available balance', e.availableBalanceKobo], ['Pending payouts', e.pendingPayoutsKobo]].map(([label, v]) => (
          <Card key={label as string}><CardContent className="py-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{naira(v as number)}</p></CardContent></Card>
        ))}
        <Card><CardContent className="py-4"><p className="text-xs text-muted-foreground">Refunds (count)</p><p className="mt-1 text-2xl font-bold">{e.refundCount}</p></CardContent></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Request payout</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">Bank: {e.payoutBank?.bankName ?? '—'} · {e.payoutBank?.accountName ?? ''} {e.payoutBank?.accountLast4 ? `••••${e.payoutBank.accountLast4}` : '(add bank details in Profile)'}</p>
          <Field label="Amount (₦)" type="number" value={amount} onChange={setAmount} />
          <Button disabled={!amount || payout.isPending} onClick={() => payout.mutate()}>Request withdrawal</Button>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Payout history</CardTitle></CardHeader><CardContent className="space-y-3">{(e.payouts ?? []).map((p: AnyRecord) => <div key={p.id} className="flex items-center justify-between text-sm"><span>{p.reference} · {fmtDate(p.createdAt)}</span><span className="flex items-center gap-2">{naira(p.amountKobo)}<StatusBadge status={titleCase(p.status)} /></span></div>)}{(e.payouts ?? []).length === 0 && <p className="text-sm text-muted-foreground">No payouts yet.</p>}</CardContent></Card>
      </div>
    </div>
  );
}

export function LogisticsProfilePage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['lp-profile'], queryFn: logisticsProviderApi.profile });
  const [form, setForm] = useState<AnyRecord>({});
  const [doc, setDoc] = useState({ name: '', url: '' });
  const loaded = q.data && !form.companyName ? q.data : null;
  const f: AnyRecord = loaded ? { ...loaded, operatingRegions: (loaded.operatingRegions ?? []).join(', '), servicesOffered: (loaded.servicesOffered ?? []).join(', ') } : form;
  const set = (k: string, v: string) => setForm({ ...f, [k]: v });
  const save = useMutation({ mutationFn: () => logisticsProviderApi.saveProfile({ companyName: f.companyName, registrationNumber: f.registrationNumber || undefined, contactName: f.contactName, businessEmail: f.businessEmail, phoneNumber: f.phoneNumber, businessAddress: f.businessAddress, operatingRegions: String(f.operatingRegions ?? '').split(',').map((s: string) => s.trim()).filter(Boolean), servicesOffered: String(f.servicesOffered ?? '').split(',').map((s: string) => s.trim()).filter(Boolean), fleetSize: Number(f.fleetSize ?? 0), description: f.description || undefined, payoutBankName: f.payoutBankName || undefined, payoutAccountName: f.payoutAccountName || undefined, payoutAccountNumber: f.payoutAccountNumber || undefined }), onSuccess: () => { toast.success('Profile saved'); qc.invalidateQueries({ queryKey: ['lp-profile'] }); }, onError: (e: Error) => toast.error(e.message) });
  const addDoc = useMutation({ mutationFn: () => logisticsProviderApi.addDocument(doc), onSuccess: () => { toast.success('Document submitted for verification'); setDoc({ name: '', url: '' }); qc.invalidateQueries({ queryKey: ['lp-profile'] }); }, onError: (e: Error) => toast.error(e.message) });
  if (q.isLoading) return <LoadingState text="Loading profile..." />;
  return (
    <div className="space-y-6">
      <PageHeader title="Provider profile & verification" description="Verification is separate from your LOGISTICS_PROVIDER account status — only VERIFIED providers can publish bookable capacity." />
      <Card><CardHeader><CardTitle className="flex items-center justify-between text-base"><span className="flex items-center gap-2"><Building2 className="h-4 w-4" />Company profile</span>{q.data && <StatusBadge status={titleCase(q.data.verificationStatus)} />}</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" value={f.companyName ?? ''} onChange={(v) => set('companyName', v)} />
          <Field label="Business registration number" value={f.registrationNumber ?? ''} onChange={(v) => set('registrationNumber', v)} />
          <Field label="Contact person's name" value={f.contactName ?? ''} onChange={(v) => set('contactName', v)} />
          <Field label="Business email" value={f.businessEmail ?? ''} onChange={(v) => set('businessEmail', v)} />
          <Field label="Phone number" value={f.phoneNumber ?? ''} onChange={(v) => set('phoneNumber', v)} />
          <Field label="Business address" value={f.businessAddress ?? ''} onChange={(v) => set('businessAddress', v)} />
          <Field label="Operating regions (comma separated)" value={f.operatingRegions ?? ''} onChange={(v) => set('operatingRegions', v)} />
          <Field label="Logistics services offered" value={f.servicesOffered ?? ''} onChange={(v) => set('servicesOffered', v)} placeholder="Same-day, Inter-state" />
          <Field label="Fleet size" type="number" value={String(f.fleetSize ?? 0)} onChange={(v) => set('fleetSize', v)} />
          <Field label="Business description" value={f.description ?? ''} onChange={(v) => set('description', v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Payout bank" value={f.payoutBankName ?? ''} onChange={(v) => set('payoutBankName', v)} />
          <Field label="Account name" value={f.payoutAccountName ?? ''} onChange={(v) => set('payoutAccountName', v)} />
          <Field label={q.data?.payoutAccountLast4 ? `Account number (current ••••${q.data.payoutAccountLast4})` : 'Account number (only last 4 stored)'} value={f.payoutAccountNumber ?? ''} onChange={(v) => set('payoutAccountNumber', v)} />
        </div>
        <Button disabled={save.isPending || !f.companyName || !f.contactName} onClick={() => save.mutate()}>Save profile</Button>
        {q.data?.verificationNote && <p className="text-sm text-muted-foreground">Admin note: {q.data.verificationNote}</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Verification documents</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
        {(q.data?.documents ?? []).map((d: AnyRecord) => <p key={d.id}><a className="text-primary hover:underline" href={d.url} target="_blank" rel="noreferrer">{d.name}</a> · {fmtDate(d.createdAt)}</p>)}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Document name" value={doc.name} onChange={(v) => setDoc({ ...doc, name: v })} placeholder="CAC certificate" />
          <Field label="Document URL" value={doc.url} onChange={(v) => setDoc({ ...doc, url: v })} placeholder="https://…" />
        </div>
        <Button disabled={!q.data || !doc.name || !doc.url || addDoc.isPending} onClick={() => addDoc.mutate()}>Submit document for review</Button>
        {!q.data && <p className="text-muted-foreground">Save your profile first, then submit documents.</p>}
      </CardContent></Card>
    </div>
  );
}
