import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sharedNetworkApi, naira, type AnyRecord} from '@/lib/shared-network-api';
import { Hint } from '@/components/ui/hint';
export default function SNAiPage() {
  const [f, setF] = useState({ destinationRegion: 'Lagos', window: 'AFTERNOON', quantity: 5, packageWeightKg: 2 });
  const rec = useMutation({ mutationFn: () => sharedNetworkApi.recommend(f), onError: (e: Error) => toast.error(e.message) });
  return <div className="space-y-6">
    <Card><CardHeader><CardTitle>AI dispatch recommendations</CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">Dispatchly AI (including WhatsApp-extracted drafts) uses this engine to recommend slots and pools. It <strong>never</strong> reserves paid capacity or spends credits without your approval — unless you enable auto-dispatch with a spend limit in Business Settings.</p>
      <div className="grid gap-4 sm:grid-cols-4"><div className="space-y-2"><Label>Destination region</Label><Input value={f.destinationRegion} onChange={(e) => setF({ ...f, destinationRegion: e.target.value })} /></div><div className="space-y-2"><Label>Window</Label><select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={f.window} onChange={(e) => setF({ ...f, window: e.target.value })}>{['MORNING', 'AFTERNOON', 'EVENING'].map((w) => <option key={w}>{w}</option>)}</select></div><div className="space-y-2"><Label>Deliveries</Label><Input type="number" min={1} value={f.quantity} onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} /></div><div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" min={0} value={f.packageWeightKg} onChange={(e) => setF({ ...f, packageWeightKg: Number(e.target.value) })} /></div></div>
      <Hint label="AI only recommends pools and capacity. Nothing is reserved and no credits are spent until you approve it"><Button disabled={rec.isPending} onClick={() => rec.mutate()}>Get recommendations</Button></Hint>
      {rec.data && <div className="space-y-3"><p className="text-sm font-medium">{rec.data.note}</p>{rec.data.recommendedPools.map((p: AnyRecord) => <div key={p.id} className="flex justify-between rounded-lg border p-3 text-sm"><span><strong>{p.name}</strong> · score {p.score}/100 · {p.reason}</span><span>{p.remaining} places left · savings {naira(p.estimatedSavingsKobo)}</span></div>)}{rec.data.recommendedPools.length === 0 && <p className="text-sm text-muted-foreground">No matching open pools. Available capacity: {rec.data.availableCapacity.length} windows.</p>}{rec.data.availableCapacity.slice(0, 3).map((c: AnyRecord) => <div key={c.id} className="flex justify-between rounded-lg border p-3 text-sm"><span>Capacity: {c.region} {c.window}</span><span>{c.available} available · {c.pricePerSlotCredits} credits/slot</span></div>)}</div>}
    </CardContent></Card>
  </div>;
}
