import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState, StatusBadge } from '@/components/admin/AdminTable';

export default function AdminBillingPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-billing', search, page], queryFn: () => adminApi.billing({ search: search || undefined, page, limit: 20 }) });
  const empty = <DataState isLoading={isLoading} error={error} items={data?.items} refetch={() => refetch()} emptyTitle="No transactions" emptyHint="Credit purchases from all users appear here." />;
  if (empty) return <div><PageHeader title="Billing & Credits" description="Platform-wide billing visibility." /><div className="mb-4"><AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search reference, email, business..." /></div>{empty}</div>;
  return (
    <div>
      <PageHeader title="Billing & Credits" description="Transactions, balances, purchases, and payment status across all users." />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[['Total balance', data!.totals.balance], ['Total points', data!.totals.points], ['Transactions', data!.totals.transactions], ['Purchases', data!.totals.purchases]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-bold">{Number(v).toLocaleString()}</p></div>
        ))}
      </div>
      <div className="mb-4"><AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search reference, email, business..." /></div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">Reference</th><th className="p-3">User</th><th className="p-3">Package</th><th className="p-3">Amount</th><th className="p-3">Credits</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
          <tbody>{data!.items.map((p) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="p-3 font-mono text-xs">{p.paymentReference}</td>
              <td className="p-3 text-xs">{p.wallet?.user?.businessName}<br />{p.wallet?.user?.email}</td>
              <td className="p-3">{p.package?.name}</td>
              <td className="p-3">₦{(p.amountKobo / 100).toLocaleString()}</td>
              <td className="p-3">{p.credits}</td>
              <td className="p-3"><StatusBadge status={p.status === 'PAID' ? 'Paid' : p.status === 'PENDING' ? 'Pending' : p.status === 'FAILED' ? 'Failed' : 'Cancelled'} /></td>
              <td className="p-3 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <AdminPager page={data!.page} total={data!.total} limit={data!.limit} onPage={setPage} />
    </div>
  );
}
