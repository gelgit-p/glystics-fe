import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, LoadingState, ErrorState, StatusBadge } from '@/components/shared';
import { adminApi } from '@/lib/admin-api';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-user', id], queryFn: () => adminApi.user(id!), enabled: !!id });
  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div>
      <PageHeader title={data.businessName || data.fullName} description={data.email} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Account</h3>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Role</dt><dd>{data.role}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd>{data.emailConfirmed ? 'Active' : 'Suspended'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">AI detection</dt><dd>{data.aiDeliveryDetectionEnabled ? 'On' : 'Off'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">WhatsApp</dt><dd>{data.facebookConnectStatus ? 'Connected' : 'Not connected'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">WABA</dt><dd className="max-w-[180px] truncate">{data.selectedWabaId ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Deliveries</dt><dd>{data.deliveries}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">AI conv / drafts</dt><dd>{data.conversations} / {data.drafts}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Wallet</h3>
          {data.creditWallet ? (
            <div className="mt-2 text-sm"><p>Balance: <strong>{data.creditWallet.balance}</strong> · Points: <strong>{data.creditWallet.points}</strong></p>
              <h4 className="mt-3 font-medium">Recent transactions</h4>
              <ul className="mt-1 space-y-1">{data.creditWallet.transactions.map((t: any) => <li key={t.id} className="flex justify-between"><span>{t.type} · {t.description?.slice(0, 40)}</span><span>{t.amount}</span></li>)}</ul>
              <h4 className="mt-3 font-medium">Purchases</h4>
              <ul className="mt-1 space-y-1">{data.creditWallet.purchases.map((p: any) => <li key={p.id} className="flex justify-between"><span>{p.package?.name} · {p.paymentReference}</span><StatusBadge status={p.status === 'PAID' ? 'Paid' : p.status === 'PENDING' ? 'Pending' : 'Failed'} /></li>)}</ul>
            </div>
          ) : <p className="mt-2 text-sm text-muted-foreground">No wallet yet.</p>}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Automations & templates</h3>
          <h4 className="mt-2 text-sm font-medium">Automations ({data.automations.length})</h4>
          <ul className="mt-1 space-y-1 text-sm">{data.automations.map((a: any) => <li key={a.id} className="flex justify-between"><span>{a.name}</span><StatusBadge status={a.enabled ? 'Active' : 'Inactive'} /></li>)}</ul>
          <h4 className="mt-3 text-sm font-medium">Templates ({data.messageTemplates.length})</h4>
          <ul className="mt-1 space-y-1 text-sm">{data.messageTemplates.map((t: any) => <li key={t.id} className="flex justify-between"><span>{t.name}</span><span className="text-muted-foreground">{t.status}</span></li>)}</ul>
        </div>
      </div>
    </div>
  );
}
