import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState, StatusBadge } from '@/components/admin/AdminTable';

export default function AdminWhatsappPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-whatsapp', search, page], queryFn: () => adminApi.whatsapp({ search: search || undefined, page, limit: 20 }) });
  const disconnect = useMutation({ mutationFn: (userId: string) => adminApi.disconnectWhatsapp(userId), onSuccess: () => { toast.success('WhatsApp disconnected'); qc.invalidateQueries({ queryKey: ['admin-whatsapp'] }); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Disconnect failed') });
  const empty = <DataState isLoading={isLoading} error={error} items={data?.items} refetch={() => refetch()} emptyTitle="No WhatsApp connections" emptyHint="Tenants with connected WhatsApp accounts appear here." />;
  if (isLoading || error || !data?.items?.length) return <div><PageHeader title="WhatsApp" description="Centralized WhatsApp integration view." /><div className="mb-4"><AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search business, email, WABA..." /></div>{empty}</div>;
  return (
    <div>
      <PageHeader title="WhatsApp" description="Connected accounts, phone numbers, connection and webhook status." />
      <div className="mb-4"><AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search business, email, WABA..." /></div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Tenant</th><th className="p-3">WABA / Business</th><th className="p-3">Numbers</th><th className="p-3">Connection</th><th className="p-3">Webhook</th><th className="p-3">Actions</th></tr></thead>
          <tbody>{data!.items.map((c) => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{c.businessName}<div className="text-xs text-muted-foreground">{c.email}</div></td>
              <td className="p-3 text-xs">{c.selectedWabaId ?? '—'}<br />{c.selectedFacebookBusinessName ?? ''}</td>
              <td className="p-3 text-xs">{c.displayPhoneNumber ?? c.selectedPhoneNumberId.join(', ') ?? '—'}<div className="text-muted-foreground">Quality: {c.selectedPhoneNumberQualityRating ?? '—'}</div></td>
              <td className="p-3"><StatusBadge status={c.facebookConnectStatus ? 'Connected' : 'Disconnected'} /></td>
              <td className="p-3"><StatusBadge status={c.webhookStatus ? 'Active' : 'Inactive'} /></td>
              <td className="p-3"><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={disconnect.isPending || !c.facebookConnectStatus}>Disconnect</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Disconnect {c.businessName}?</AlertDialogTitle><AlertDialogDescription>This clears their connection flags. Their stored tokens/numbers stay but inbound stops routing until they reconnect.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => disconnect.mutate(c.id)}>Disconnect</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <AdminPager page={data!.page} total={data!.total} limit={data!.limit} onPage={setPage} />
    </div>
  );
}
