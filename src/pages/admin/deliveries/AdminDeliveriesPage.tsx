import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState, StatusBadge } from '@/components/admin/AdminTable';

const STATUS_OPTIONS = ['ALL', 'CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'BOOKING_FAILED', 'CANCELLED'];

export default function AdminDeliveriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-deliveries', search, status, page], queryFn: () => adminApi.deliveries({ search: search || undefined, status: status === 'ALL' ? undefined : status, page, limit: 20 }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-deliveries'] });
  const cancel = useMutation({ mutationFn: (id: string) => adminApi.cancelDelivery(id), onSuccess: () => { toast.success('Delivery cancelled'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Cancel failed') });
  const remove = useMutation({ mutationFn: (id: string) => adminApi.deleteDelivery(id), onSuccess: () => { toast.success('Delivery removed'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Delete failed (paid deliveries cannot be deleted)') });

  const empty = <DataState isLoading={isLoading} error={error} items={data?.items} refetch={() => refetch()} emptyTitle="No deliveries" emptyHint="Deliveries from all users appear here." />;
  if (empty) return <div><PageHeader title="Deliveries" description="Every delivery across all users." /><div className="mb-4"><AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tracking ID, names, phone..." /></div>{empty}</div>;

  return (
    <div>
      <PageHeader title="Deliveries" description="Inspect, update, cancel, or remove platform deliveries." />
      <div className="mb-4 flex flex-wrap gap-3">
        <AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tracking ID, names, phone..." />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-52"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Tracking</th><th className="p-3">Route</th><th className="p-3">Courier</th><th className="p-3">Status</th><th className="p-3">Payment</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {data!.items.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="p-3"><Link to={`/admin/deliveries/${d.id}`} className="font-medium hover:underline">{d.trackingId}</Link><div className="text-xs text-muted-foreground">{d.packageName}</div></td>
                <td className="p-3 text-xs">{d.senderName} → {d.receiverName}<br />{d.receiverPhone}</td>
                <td className="p-3">{d.courier_name ?? '—'}</td>
                <td className="p-3"><StatusBadge status={d.deliveryStatus === 'DELIVERED' ? 'Completed' : d.deliveryStatus === 'CANCELLED' ? 'Cancelled' : d.deliveryStatus === 'IN_TRANSIT' ? 'In Transit' : ['FAILED', 'BOOKING_FAILED'].includes(d.deliveryStatus ?? '') ? 'Failed' : 'Pending'} /><div className="mt-1 text-xs text-muted-foreground">{d.deliveryStatus}</div></td>
                <td className="p-3 text-xs">{d.paymentStatus}{d.paymentAmount ? ` · ${d.paymentAmount}` : ''}</td>
                <td className="p-3 text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="p-3"><div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={cancel.isPending} onClick={() => cancel.mutate(d.id)}>Cancel</Button>
                  <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive">Remove</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove {d.trackingId}?</AlertDialogTitle><AlertDialogDescription>Paid deliveries cannot be deleted — cancel them instead. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep</AlertDialogCancel><AlertDialogAction onClick={() => remove.mutate(d.id)}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPager page={data!.page} total={data!.total} limit={data!.limit} onPage={setPage} />
    </div>
  );
}
