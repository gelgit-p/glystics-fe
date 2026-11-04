import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/admin-api';
import { AdminPager, AdminSearch, DataState, StatusBadge } from '@/components/admin/AdminTable';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-users', search, page], queryFn: () => adminApi.users({ search: search || undefined, page, limit: 20 }) });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['admin-overview'] }); };
  const setRole = useMutation({ mutationFn: (u: { id: string; role: string }) => adminApi.setRole(u.id, (u.role === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN') as any), onSuccess: () => { toast.success('Role updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Role update failed') });
  const setSuspended = useMutation({ mutationFn: (u: { id: string; emailConfirmed: boolean }) => adminApi.setSuspended(u.id, u.emailConfirmed), onSuccess: () => { toast.success('Account status updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed') });
  const setDetection = useMutation({ mutationFn: (u: { id: string; aiDeliveryDetectionEnabled: boolean }) => adminApi.setDetection(u.id, !u.aiDeliveryDetectionEnabled), onSuccess: () => { toast.success('AI detection updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed') });
  const remove = useMutation({ mutationFn: (id: string) => adminApi.deleteUser(id), onSuccess: () => { toast.success('User deleted'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Delete failed') });
  const adjust = useMutation({ mutationFn: ({ id, amount, description }: { id: string; amount: number; description?: string }) => adminApi.adjustCredits(id, amount, description), onSuccess: () => { toast.success('Credits adjusted'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Adjustment failed') });

  const rows = (data?.items ?? []).filter((u) => roleFilter === 'ALL' || u.role === roleFilter);
  const empty = <DataState isLoading={isLoading} error={error} items={data?.items} refetch={() => refetch()} emptyTitle="No users found" emptyHint="Users appear here once they register in the user app." />;
  if (isLoading || error || !data?.items?.length) return <div><PageHeader title="Users" description="All registered tenants with roles, credits, and AI status." /><div className="mb-4 flex flex-wrap gap-3"><AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, business, email..." /></div>{empty}</div>;

  return (
    <div>
      <PageHeader title="Users" description="Manage accounts, roles, suspension, credits, and AI detection." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, business, email..." />
        <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All roles</SelectItem><SelectItem value="USER">USER</SelectItem><SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem></SelectContent></Select>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead><tr className="border-b text-left text-muted-foreground"><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Credits</th><th className="p-3">AI detection</th><th className="p-3">Activity</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3"><Link to={`/admin/users/${u.id}`} className="font-medium hover:underline">{u.businessName || u.fullName}</Link><br /><span className="text-muted-foreground">{u.email}</span><br /><span className="text-xs text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</span></td>
                <td className="p-3"><StatusBadge status={u.role === 'SUPER_ADMIN' ? 'Active' : 'Inactive'} /><span className="ml-2">{u.role}</span></td>
                <td className="p-3">{u.emailConfirmed ? <StatusBadge status="Connected" /> : <StatusBadge status="Disconnected" />}<div className="mt-1 text-xs text-muted-foreground">{u.emailConfirmed ? 'Active' : 'Suspended'}</div></td>
                <td className="p-3">{u.creditWallet ? `${u.creditWallet.balance} credits · ${u.creditWallet.points} pts` : '—'}</td>
                <td className="p-3"><Switch checked={u.aiDeliveryDetectionEnabled} disabled={setDetection.isPending} onCheckedChange={() => setDetection.mutate(u)} aria-label={`AI detection for ${u.email}`} /></td>
                <td className="p-3 text-xs">{u._count.aiConversations} conv · {u._count.deliveryDrafts} drafts · {u._count.automations} auto · {u._count.messageTemplates} tpl</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={setRole.isPending} onClick={() => setRole.mutate(u)}>{u.role === 'SUPER_ADMIN' ? 'Demote' : 'Promote'}</Button>
                    <Button size="sm" variant="outline" disabled={setSuspended.isPending} onClick={() => setSuspended.mutate(u)}>{u.emailConfirmed ? 'Suspend' : 'Reactivate'}</Button>
                    <CreditAdjustDialog userId={u.id} onSubmit={(amount, description) => adjust.mutate({ id: u.id, amount, description })} pending={adjust.isPending} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="sm" variant="destructive">Delete</Button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {u.email}?</AlertDialogTitle><AlertDialogDescription>This permanently removes the user and their data. Users with deliveries cannot be deleted. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove.mutate(u.id)}>Delete user</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPager page={data!.page} total={data!.total} limit={data!.limit} onPage={setPage} />
    </div>
  );
}

function CreditAdjustDialog({ userId, onSubmit, pending }: { userId: string; onSubmit: (amount: number, description?: string) => void; pending: boolean }) {
  const [amount, setAmount] = useState('10');
  const [description, setDescription] = useState('');
  void userId;
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm" variant="outline">Credits</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adjust credits</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (negative to debit)" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Reason (optional)" />
          <Button disabled={pending} onClick={() => onSubmit(Number(amount), description || undefined)}>Apply adjustment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
