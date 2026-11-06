import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sharedNetworkApi, fmtDate } from '@/lib/shared-network-api';
import { Hint } from '@/components/ui/hint';

export default function SNSlotsPage() {
  const qc = useQueryClient(); const [f, setF] = useState({ title: 'Afternoon dispatch', date: new Date().toISOString().slice(0, 10), window: 'AFTERNOON', quantity: 10, pickupLocation: '', isRecurring: false, recurrence: 'WEEKLY' });
  const q = useQuery({ queryKey: ['sn-slots'], queryFn: sharedNetworkApi.slots });
  const inv = () => qc.invalidateQueries({ queryKey: ['sn-slots'] });
  const create = useMutation({ mutationFn: () => sharedNetworkApi.createSlot({ ...f, quantity: Number(f.quantity) }), onSuccess: () => { toast.success('Slot created'); inv(); }, onError: (e: Error) => toast.error(e.message) });
  const book = useMutation({ mutationFn: (id: string) => sharedNetworkApi.bookSlot(id), onSuccess: () => { toast.success('Slot booked — capacity reserved'); inv(); qc.invalidateQueries({ queryKey: ['sn-reservations'] }); }, onError: (e: Error) => toast.error(e.message) });
  const unbook = useMutation({ mutationFn: sharedNetworkApi.unbookSlot, onSuccess: () => { toast.success('Booking cancelled'); inv(); }, onError: (e: Error) => toast.error(e.message) });
  const del = useMutation({ mutationFn: sharedNetworkApi.deleteSlot, onSuccess: inv });
  return <div className="space-y-6">
    <Card><CardHeader><CardTitle>Create a delivery slot</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2"><Label>Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="space-y-2"><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
      <div className="space-y-2"><Label>Window</Label><select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={f.window} onChange={(e) => setF({ ...f, window: e.target.value })}>{['MORNING', 'AFTERNOON', 'EVENING', 'CUSTOM'].map((w) => <option key={w}>{w}</option>)}</select></div>
      <div className="space-y-2"><Label>Quantity</Label><Input type="number" min={1} value={f.quantity} onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} /></div>
      <div className="space-y-2"><Label>Pickup location</Label><Input value={f.pickupLocation} onChange={(e) => setF({ ...f, pickupLocation: e.target.value })} /></div>
      <div className="space-y-2"><Label>Recurring</Label><select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={f.isRecurring ? f.recurrence : 'NONE'} onChange={(e) => setF({ ...f, isRecurring: e.target.value !== 'NONE', recurrence: e.target.value })}><option value="NONE">One-time</option><option>DAILY</option><option>WEEKLY</option></select></div>
      <Button className="sm:col-span-3" disabled={create.isPending} onClick={() => create.mutate()}>Create slot</Button>
    </CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(q.data ?? []).map((s) => <Card key={s.id}><CardHeader><CardTitle className="text-base">{s.title}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>{fmtDate(s.date)} · {s.window} · {s.quantity} deliveries</p><p className="text-muted-foreground">{s.pickupLocation} {s.isRecurring ? `· repeats ${s.recurrence}` : ''}</p><p>Status: <strong>{s.status}</strong></p><div className="flex gap-2">{s.status !== 'BOOKED' && s.status !== 'CANCELLED' && <Hint label="Booking reserves matching capacity for this slot and charges your Billing credits"><Button size="sm" onClick={() => book.mutate(s.id)}>Book (reserves capacity)</Button></Hint>}{s.status === 'BOOKED' && <Hint label="Cancels the booking, releases the capacity and refunds the credits to your Billing wallet"><Button size="sm" variant="outline" onClick={() => unbook.mutate(s.id)}>Cancel booking</Button></Hint>}<Hint label="Deletes this slot draft. Booked capacity must be cancelled first to get a refund"><Button size="sm" variant="ghost" onClick={() => del.mutate(s.id)}>Delete</Button></Hint></div></CardContent></Card>)}</div>
    {(q.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No slots yet — create your first scheduled dispatch above.</p>}
  </div>;
}
