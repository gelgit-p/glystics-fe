import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { sharedNetworkApi, type AnyRecord} from '@/lib/shared-network-api';
const split = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
export default function SNSettingsPage() {
  const qc = useQueryClient(); const q = useQuery({ queryKey: ['sn-business'], queryFn: sharedNetworkApi.business });
  const [f, setF] = useState<AnyRecord | null>(null);
  useEffect(() => { if (q.data && !f) setF({ ...q.data, pickupLocations: q.data.pickupLocations.join(', '), operatingRegions: q.data.operatingRegions.join(', '), preferredWindows: q.data.preferredWindows.join(', ') }); }, [q.data, f]);
  const save = useMutation({ mutationFn: () => { if (!f) throw new Error('Not loaded'); return sharedNetworkApi.updateBusiness({ businessName: f.businessName, businessEmail: f.businessEmail, contactPhone: f.contactPhone, category: f.category, pickupLocations: split(f.pickupLocations), operatingRegions: split(f.operatingRegions), expectedDailyVolume: Number(f.expectedDailyVolume), expectedWeeklyVolume: Number(f.expectedWeeklyVolume), preferredWindows: split(f.preferredWindows), aiAutoDispatchEnabled: f.aiAutoDispatchEnabled, aiAutoReserveEnabled: f.aiAutoReserveEnabled, aiSpendLimitCredits: f.aiSpendLimitCredits ? Number(f.aiSpendLimitCredits) : undefined }); }, onSuccess: () => { toast.success('Settings saved'); qc.invalidateQueries({ queryKey: ['sn-business'] }); }, onError: (e: Error) => toast.error(e.message) });
  if (!f) return null;
  const set = (k: string, v: unknown) => setF((p: AnyRecord) => ({ ...p, [k]: v }));
  return <div className="mx-auto max-w-2xl space-y-6"><Card><CardHeader><CardTitle>Business settings</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
    {(['businessName', 'businessEmail', 'contactPhone', 'category', 'pickupLocations', 'operatingRegions', 'preferredWindows'] as const).map((k) => <div key={k} className="space-y-2"><Label>{k}</Label><Input value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} /></div>)}
    <div className="space-y-2"><Label>Expected daily volume</Label><Input type="number" value={f.expectedDailyVolume} onChange={(e) => set('expectedDailyVolume', e.target.value)} /></div>
    <div className="space-y-2"><Label>Expected weekly volume</Label><Input type="number" value={f.expectedWeeklyVolume} onChange={(e) => set('expectedWeeklyVolume', e.target.value)} /></div>
  </CardContent></Card>
  <Card><CardHeader><CardTitle>AI automation permissions</CardTitle></CardHeader><CardContent className="space-y-4">
    <label className="flex items-center justify-between text-sm">Auto-dispatch after approval rules <Switch checked={!!f.aiAutoDispatchEnabled} onCheckedChange={(v) => set('aiAutoDispatchEnabled', v)} /></label>
    <label className="flex items-center justify-between text-sm">Allow AI to reserve capacity <Switch checked={!!f.aiAutoReserveEnabled} onCheckedChange={(v) => set('aiAutoReserveEnabled', v)} /></label>
    <div className="space-y-2"><Label>AI spend limit (credits per action)</Label><Input type="number" value={f.aiSpendLimitCredits ?? ''} onChange={(e) => set('aiSpendLimitCredits', e.target.value)} placeholder="Leave empty to always require approval" /></div>
  </CardContent></Card>
  <Button className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>Save settings</Button></div>;
}
