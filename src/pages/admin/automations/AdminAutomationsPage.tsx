import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState, StatusBadge } from '@/components/admin/AdminTable';

export default function AdminAutomationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [enabled, setEnabled] = useState('ALL');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-automations', search, enabled, page], queryFn: () => adminApi.automations({ search: search || undefined, enabled: enabled === 'ALL' ? undefined : enabled, page, limit: 20 }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-automations'] });
  const toggle = useMutation({ mutationFn: (a: { id: string; enabled: boolean }) => adminApi.toggleAutomation(a.id, !a.enabled), onSuccess: () => { toast.success('Automation updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed') });
  const remove = useMutation({ mutationFn: (id: string) => adminApi.deleteAutomation(id), onSuccess: () => { toast.success('Automation removed'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Delete failed') });
  const empty = <DataState isLoading={isLoading} error={error} items={data?.items} refetch={() => refetch()} emptyTitle="No automations" emptyHint="Automations from all users appear here." />;
  if (empty) return <div><PageHeader title="Automations" description="Inspect, disable, or remove user automations." /><Filters search={search} setSearch={(v) => { setSearch(v); setPage(1); }} enabled={enabled} setEnabled={(v) => { setEnabled(v); setPage(1); }} />{empty}</div>;
  return (
    <div>
      <PageHeader title="Automations" description="Triggers, actions, run history, and errors." />
      <Filters search={search} setSearch={(v) => { setSearch(v); setPage(1); }} enabled={enabled} setEnabled={(v) => { setEnabled(v); setPage(1); }} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Automation</th><th className="p-3">Owner</th><th className="p-3">Trigger → Action</th><th className="p-3">Runs</th><th className="p-3">Active</th><th className="p-3">Actions</th></tr></thead>
          <tbody>{data!.items.map((a) => (
            <tr key={a.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{a.name}<div className="text-xs text-muted-foreground">{a.lastTriggered ? `Last run ${new Date(a.lastTriggered).toLocaleString()}` : 'Never run'}</div></td>
              <td className="p-3 text-xs">{a.user ? `${a.user.businessName} (${a.user.email})` : '—'}</td>
              <td className="p-3 text-xs">{a.trigger}{a.triggerValue ? `: ${a.triggerValue}` : ''} → {a.action}: {a.actionTemplate}</td>
              <td className="p-3">{a.totalRuns}</td>
              <td className="p-3"><div className="flex items-center gap-2"><Switch checked={a.enabled} onCheckedChange={() => toggle.mutate(a)} aria-label={`Toggle ${a.name}`} /><StatusBadge status={a.enabled ? 'Active' : 'Inactive'} /></div></td>
              <td className="p-3"><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive">Remove</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove {a.name}?</AlertDialogTitle><AlertDialogDescription>This disables the tenant automation permanently. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove.mutate(a.id)}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <AdminPager page={data!.page} total={data!.total} limit={data!.limit} onPage={setPage} />
    </div>
  );
}

function Filters({ search, setSearch, enabled, setEnabled }: { search: string; setSearch: (v: string) => void; enabled: string; setEnabled: (v: string) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <AdminSearch value={search} onChange={setSearch} placeholder="Search name, trigger, action..." />
      <Select value={enabled} onValueChange={setEnabled}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select>
    </div>
  );
}
