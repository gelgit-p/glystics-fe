import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState, StatusBadge } from '@/components/admin/AdminTable';

export default function AdminNotificationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-notifications', search, status, page], queryFn: () => adminApi.notifications({ search: search || undefined, status: status === 'ALL' ? undefined : status, page, limit: 20 }) });
  const empty = <DataState isLoading={isLoading} error={error} items={data?.items} refetch={() => refetch()} emptyTitle="No notifications" emptyHint="WhatsApp and delivery notifications from all users appear here." />;
  if (empty) return <div><PageHeader title="Notifications" description="Platform notification history." /><Filters search={search} setSearch={(v) => { setSearch(v); setPage(1); }} status={status} setStatus={(v) => { setStatus(v); setPage(1); }} />{empty}</div>;
  return (
    <div>
      <PageHeader title="Notifications" description="WhatsApp notifications, delivery status updates, failures." />
      <Filters search={search} setSearch={(v) => { setSearch(v); setPage(1); }} status={status} setStatus={(v) => { setStatus(v); setPage(1); }} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Recipient</th><th className="p-3">Template</th><th className="p-3">Tracking</th><th className="p-3">Status</th><th className="p-3">Sent</th></tr></thead>
          <tbody>{data!.items.map((n) => (
            <tr key={n.id} className="border-b last:border-0">
              <td className="p-3">{n.recipientPhone}</td>
              <td className="p-3">{n.templateName}<div className="text-xs text-muted-foreground">{n.templateLanguage}</div></td>
              <td className="p-3 text-xs">{n.deliveryTrackingId ?? '—'}</td>
              <td className="p-3">{n.status ? <StatusBadge status={n.status === 'failed' ? 'Failed' : n.status === 'read' ? 'Read' : n.status === 'delivered' ? 'Delivered' : 'Sent'} /> : '—'}<div className="text-xs text-muted-foreground">{n.status ?? ''}</div></td>
              <td className="p-3 text-xs">{new Date(n.createdAt).toLocaleString()}</td>
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
      <AdminSearch value={search} onChange={setSearch} placeholder="Search phone, template, tracking..." />
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="delivered">Delivered</SelectItem><SelectItem value="read">Read</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select>
    </div>
  );
}
