import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/shared';
import { logisticsProviderApi, naira, type AnyRecord } from '@/lib/logistics-provider-api';

const empty = { name: '', region: 'Lagos', state: 'Lagos', city: 'Lagos', pickupLocation: '', supportedDestinations: '', restrictedLocations: '', priceNaira: 1000, distantSurchargeNaira: 0, estimatedDeliveryHours: 24, minPackages: 1, maxPackages: '', maxWeightKg: '', supportedSizes: '' };

export default function LogisticsZonesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const q = useQuery({ queryKey: ['lp-zones'], queryFn: logisticsProviderApi.zones });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['lp-zones'] });
  const create = useMutation({
    mutationFn: () => logisticsProviderApi.createZone({
      name: form.name, region: form.region, state: form.state, city: form.city, pickupLocation: form.pickupLocation,
      supportedDestinations: form.supportedDestinations.split(',').map((s) => s.trim()).filter(Boolean),
      restrictedLocations: form.restrictedLocations.split(',').map((s) => s.trim()).filter(Boolean),
      deliveryPriceKobo: Math.round(Number(form.priceNaira) * 100), distantSurchargeKobo: Math.round(Number(form.distantSurchargeNaira) * 100),
      estimatedDeliveryHours: Number(form.estimatedDeliveryHours), minPackages: Number(form.minPackages),
      maxPackages: form.maxPackages ? Number(form.maxPackages) : undefined, maxWeightKg: form.maxWeightKg ? Number(form.maxWeightKg) : undefined,
      supportedSizes: form.supportedSizes.split(',').map((s) => s.trim()).filter(Boolean),
    }),
    onSuccess: () => { toast.success('Zone created'); setForm(empty); invalidate(); }, onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({ mutationFn: (z: AnyRecord) => logisticsProviderApi.updateZone(z.id, { name: z.name, region: z.region, state: z.state, city: z.city, pickupLocation: z.pickupLocation, supportedDestinations: z.supportedDestinations, deliveryPriceKobo: z.deliveryPriceKobo, isActive: !z.isActive }), onSuccess: invalidate, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: logisticsProviderApi.deleteZone, onSuccess: () => { toast.success('Zone deleted'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const field = (label: string, key: keyof typeof empty, type = 'text', placeholder?: string) => (<div className="space-y-2"><Label>{label}</Label><Input type={type} value={String(form[key])} placeholder={placeholder} onChange={(e) => set(key, e.target.value)} /></div>);
  if (q.isLoading) return <LoadingState text="Loading zones..." />;
  return (
    <div className="space-y-6">
      <PageHeader title="Delivery zones" description="Where you pick up and deliver. Capacity can only be published inside configured coverage once zones exist." />
      <Card><CardHeader><CardTitle className="text-base">Create delivery zone</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {field('Zone name', 'name', 'text', 'Lagos Island')}{field('Region', 'region')}{field('State', 'state')}{field('City', 'city')}
          {field('Pickup location', 'pickupLocation', 'text', '12 Marina St, Lagos Island')}
          {field('Supported destinations (comma separated)', 'supportedDestinations', 'text', 'Ikeja, Lekki, Yaba')}
          {field('Restricted locations', 'restrictedLocations')}
          {field('Delivery price (₦)', 'priceNaira', 'number')}{field('Distant surcharge (₦)', 'distantSurchargeNaira', 'number')}
          {field('Estimated delivery (hours)', 'estimatedDeliveryHours', 'number')}
          {field('Minimum packages', 'minPackages', 'number')}{field('Maximum packages', 'maxPackages', 'number')}
          {field('Maximum weight (kg)', 'maxWeightKg', 'number')}{field('Supported sizes', 'supportedSizes', 'text', 'Small, Medium, Large')}
        </div>
        <Button disabled={create.isPending || !form.name || !form.pickupLocation} onClick={() => create.mutate()}>Create zone</Button>
      </CardContent></Card>
      {(q.data ?? []).length === 0 ? <EmptyState icon={MapPin} title="No zones yet" description="Create a zone so businesses know where you deliver." /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(q.data ?? []).map((z: AnyRecord) => (
          <Card key={z.id}><CardHeader><CardTitle className="flex items-center justify-between text-base">{z.name}<StatusBadge status={z.isActive ? 'Active' : 'Inactive'} /></CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{z.city}, {z.state} · Pickup: {z.pickupLocation}</p>
            <p>Destinations: {(z.supportedDestinations ?? []).join(', ') || '—'}</p>
            <p>{naira(z.deliveryPriceKobo)} · ~{z.estimatedDeliveryHours}h · {z.minPackages}–{z.maxPackages ?? '∞'} pkgs</p>
            <div className="flex items-center justify-between pt-2"><span className="flex items-center gap-2">Active <Switch checked={z.isActive} onCheckedChange={() => toggle.mutate(z)} /></span>
              <Button size="sm" variant="outline" onClick={() => { if (confirm('Delete this zone?')) remove.mutate(z.id); }}><Trash2 className="h-3 w-3" /></Button></div>
          </CardContent></Card>))}
        </div>)}
    </div>
  );
}
