import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState } from '@/components/admin/AdminTable';

export default function AdminTemplatesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-templates', search, status, page], queryFn: () => adminApi.templates({ search: search || undefined, status: status === 'ALL' ? undefined : status, page, limit: 20 }) });
  const remove = useMutation({ mutationFn: (id: string) => adminApi.deleteTemplate(id), onSuccess: () => { toast.success('Template removed'); qc.invalidateQueries({ queryKey: ['admin-templates'] }); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Delete failed') });
  const empty = <DataState isLoading={isLoading} error={error} items={data?.items} refetch={() => refetch()} emptyTitle="No templates" emptyHint="Message templates from all users appear here." />;
  if (isLoading || error || !data?.items?.length) return <div><PageHeader title="Templates" description="WhatsApp message templates across all users." /><Filters search={search} setSearch={(v) => { setSearch(v); setPage(1); }} status={status} setStatus={(v) => { setStatus(v); setPage(1); }} />{empty}</div>;
  return (
    <div>
      <PageHeader title="Templates" description="View approval status and owning WABA; delete where supported." />
      <Filters search={search} setSearch={(v) => { setSearch(v); setPage(1); }} status={status} setStatus={(v) => { setStatus(v); setPage(1); }} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Template</th><th className="p-3">Category</th><th className="p-3">Approval</th><th className="p-3">Owner / WABA</th><th className="p-3">Updated</th><th className="p-3">Actions</th></tr></thead>
          <tbody>{data!.items.map((t) => (
            <tr key={t.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{t.name}<div className="text-xs text-muted-foreground">{t.language}</div></td>
              <td className="p-3">{t.category}</td>
              <td className="p-3">{t.status}</td>
              <td className="p-3 text-xs">{t.user ? `${t.user.businessName} (${t.user.email})` : '—'}<br />{t.user?.selectedWabaId ?? ''}</td>
              <td className="p-3 text-xs">{new Date(t.updatedAt).toLocaleDateString()}</td>
              <td className="p-3"><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive">Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {t.name}?</AlertDialogTitle><AlertDialogDescription>Removes the local record. Meta-side deletion is handled by the template owner where supported.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove.mutate(t.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <AdminPager page={data!.page} total={data!.total} limit={data!.limit} onPage={setPage} />
    </div>
  );
}

function Filters({ search, setSearch, status, setStatus }: { search: string; setSearch: (v: string) => void; status: string; setStatus: (v: string) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <AdminSearch value={search} onChange={setSearch} placeholder="Search name or category..." />
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="APPROVED">APPROVED</SelectItem><SelectItem value="PENDING">PENDING</SelectItem><SelectItem value="REJECTED">REJECTED</SelectItem></SelectContent></Select>
    </div>
  );
}
