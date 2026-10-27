import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bot, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { aiApi, type AdminUser } from '@/lib/ai-api';

export function AiDeliveryDetectionCard() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['ai-settings'], queryFn: aiApi.settings });
  const toggle = useMutation({
    mutationFn: (enabled: boolean) => aiApi.updateSettings(enabled),
    onSuccess: (s) => { toast.success(s.aiDeliveryDetectionEnabled ? 'AI delivery detection enabled' : 'AI delivery detection disabled'); qc.setQueryData(['ai-settings'], s); qc.invalidateQueries({ queryKey: ['ai-overview'] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update AI setting'),
  });
  const s = settings.data;
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold">AI Delivery Detection</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              When enabled, Dispatchly AI reads inbound WhatsApp messages, detects delivery requests, extracts details, asks follow-up questions, and prepares drafts for your approval. When disabled, messages are still stored in the AI Inbox but are never processed, quoted, or replied to by AI.
            </p>
            {s && !s.globalEnabled && <p className="mt-2 text-sm font-medium text-amber-600">Currently disabled globally by a super admin (AI_DELIVERY_DETECTION_DISABLED). Your switch will take effect when the global switch is re-enabled.</p>}
            {s && <p className="mt-2 text-xs text-muted-foreground">Status: {s.effectiveEnabled ? 'Active' : 'Inactive'} · AI mode: {s.aiMode}{s.aiMode === 'demo' ? ' (simulated extraction)' : ''} · Role: {s.role}</p>}
          </div>
        </div>
        <Switch
          checked={s?.aiDeliveryDetectionEnabled ?? true}
          disabled={!s || toggle.isPending}
          onCheckedChange={(checked) => toggle.mutate(checked)}
          aria-label="Enable AI delivery detection"
        />
      </div>
    </div>
  );
}

export function SuperAdminAiPanel() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['ai-settings'], queryFn: aiApi.settings });
  const isSuperAdmin = settings.data?.role === 'SUPER_ADMIN';
  const overview = useQuery({ queryKey: ['ai-admin-overview'], queryFn: aiApi.adminOverview, enabled: isSuperAdmin });
  const users = useQuery({ queryKey: ['ai-admin-users'], queryFn: aiApi.adminUsers, enabled: isSuperAdmin });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ['ai-admin-users'] }); qc.invalidateQueries({ queryKey: ['ai-admin-overview'] }); };
  const setRole = useMutation({ mutationFn: (u: AdminUser) => aiApi.adminSetRole(u.id, u.role === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN'), onSuccess: () => { toast.success('User role updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Role update failed') });
  const setDetection = useMutation({ mutationFn: (u: AdminUser) => aiApi.adminSetDetection(u.id, !u.aiDeliveryDetectionEnabled), onSuccess: () => { toast.success('Tenant AI detection updated'); invalidate(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed') });

  if (!isSuperAdmin) return null;
  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <h3 className="font-semibold">Super Admin — Dispatchly AI</h3>
          <p className="text-sm text-muted-foreground">Global AI controls. Global kill-switch is server env <code>AI_DELIVERY_DETECTION_DISABLED</code> (currently {overview.data?.globalEnabled === false ? 'ON — all detection disabled' : 'off'}).</p>
        </div>
      </div>
      {overview.data && (
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[['Users', overview.data.users], ['Super admins', overview.data.superAdmins], ['Detection enabled', overview.data.tenantsWithDetectionEnabled], ['Drafts / Approvals', `${overview.data.drafts} / ${overview.data.approvals}`]].map(([l, v]) => (
            <div key={l as string} className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground">{l}</p><p className="text-lg font-bold">{v}</p></div>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="p-2">Business / Email</th><th className="p-2">Role</th><th className="p-2">AI Detection</th><th className="p-2">Activity</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {(users.data ?? []).map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2"><strong>{u.businessName}</strong><br /><span className="text-muted-foreground">{u.email}</span></td>
                <td className="p-2">{u.role}</td>
                <td className="p-2"><Switch checked={u.aiDeliveryDetectionEnabled} disabled={setDetection.isPending} onCheckedChange={() => setDetection.mutate(u)} aria-label={`Toggle AI detection for ${u.email}`} /></td>
                <td className="p-2">{u._count.aiConversations} conv · {u._count.deliveryDrafts} drafts</td>
                <td className="p-2"><button className="rounded-md border px-2 py-1 text-xs" disabled={setRole.isPending} onClick={() => setRole.mutate(u)}>{u.role === 'SUPER_ADMIN' ? 'Demote to USER' : 'Promote to SUPER_ADMIN'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
