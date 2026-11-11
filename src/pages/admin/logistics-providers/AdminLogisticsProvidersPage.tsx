import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, CheckCircle2, Copy, ExternalLink, Eye, Landmark, ShieldAlert, XCircle } from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminApi, type LogisticsProviderAdmin, type LogisticsProviderDocument, type LogisticsVerificationAction } from '@/lib/admin-api';
import { DataState } from '@/components/admin/AdminTable';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString('en-NG') : '—');
const verificationBadge: Record<string, string> = {
  VERIFIED: 'Approved', PENDING_VERIFICATION: 'Pending', UNVERIFIED: 'Pending', REJECTED: 'Rejected', SUSPENDED: 'Failed',
};

function isPreviewable(url: string) {
  return /\.(png|jpe?g|gif|webp|svg|pdf)(\?.*)?$/i.test(url);
}

export default function AdminLogisticsProvidersPage() {
  const qc = useQueryClient();
  // Default tab: pending verification queue first — it's the actionable worklist.
  const [status, setStatus] = useState('PENDING_VERIFICATION');
  const [preview, setPreview] = useState<{ provider: LogisticsProviderAdmin; doc: LogisticsProviderDocument } | null>(null);
  const [payoutProvider, setPayoutProvider] = useState<LogisticsProviderAdmin | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-logistics-providers'], queryFn: adminApi.logisticsProviders });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-logistics-providers'] });
  const decide = useMutation({
    mutationFn: ({ p, action }: { p: LogisticsProviderAdmin; action: LogisticsVerificationAction }) => adminApi.setProviderVerification(p.id, action, notes[p.id] || undefined),
    onSuccess: (_d, { p, action }) => {
      toast.success(action === 'VERIFIED' ? `${p.companyName} verified — they can now publish bookable capacity` : `${p.companyName} marked ${action.toLowerCase().replace('_', ' ')}`);
      if (action === 'VERIFIED') setPreview(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Verification update failed'),
  });

  const rows = (data ?? []).filter((p) => status === 'ALL' || p.verificationStatus === status);
  const empty = <DataState isLoading={isLoading} error={error} items={data} refetch={() => refetch()} emptyTitle="No logistics providers yet" emptyHint="Providers appear here after a SUPER_ADMIN grants LOGISTICS_PROVIDER status and the user completes their provider profile." />;
  if (isLoading || error || !data?.length) {
    return <div><PageHeader title="Logistics Providers" description="Review provider companies, preview their CAC/verification documents, and approve verification." />{empty}</div>;
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Logistics Providers" description="Review each company and its submitted documents. Approving verification lets the provider publish bookable capacity." />
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-56"><SelectValue /></SelectTrigger><SelectContent>
        <SelectItem value="ALL">All verification statuses</SelectItem>
        {['PENDING_VERIFICATION', 'UNVERIFIED', 'VERIFIED', 'REJECTED', 'SUSPENDED'].map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
      </SelectContent></Select>

      {rows.length === 0 ? <p className="text-sm text-muted-foreground">No providers with this verification status.</p> : rows.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span className="flex items-center gap-2"><Building2 className="h-4 w-4" />{p.companyName}</span>
              <StatusBadge status={verificationBadge[p.verificationStatus] ?? 'Pending'} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <p><span className="text-muted-foreground">Account:</span> {p.user?.email ?? '—'} <span className="text-muted-foreground">({p.user?.role ?? '—'})</span></p>
              <p><span className="text-muted-foreground">Contact:</span> {p.contactName} · {p.phoneNumber}</p>
              <p><span className="text-muted-foreground">Business email:</span> {p.businessEmail}</p>
              <p><span className="text-muted-foreground">CAC / registration no:</span> {p.registrationNumber ?? '—'}</p>
              <p><span className="text-muted-foreground">Address:</span> {p.businessAddress}</p>
              <p><span className="text-muted-foreground">Regions:</span> {(p.operatingRegions ?? []).join(', ') || '—'} · <span className="text-muted-foreground">Fleet:</span> {p.fleetSize}</p>
              <p><span className="text-muted-foreground">Services:</span> {(p.servicesOffered ?? []).join(', ') || '—'}</p>
              <p><span className="text-muted-foreground">Capacity / reservations:</span> {p._count?.capacities ?? 0} / {p._count?.reservations ?? 0}</p>
              <p><span className="text-muted-foreground">Payout bank:</span>{' '}
                {p.payoutBankName || p.payoutAccountNumber ? (
                  <button type="button" onClick={() => setPayoutProvider(p)} title="View payout bank details" className="font-medium text-primary underline decoration-dotted underline-offset-2 hover:opacity-80">
                    {p.payoutBankName ?? 'Bank'} {p.payoutAccountNumber ?? ''} <Eye className="inline h-3.5 w-3.5" />
                  </button>
                ) : '—'}
              </p>
              <p><span className="text-muted-foreground">Submitted:</span> {fmtDate(p.createdAt)}</p>
            </div>
            {p.description && <p className="text-muted-foreground">{p.description}</p>}

            <div>
              <p className="mb-2 font-medium">Verification documents / links returned</p>
              {p.documents.length === 0 ? <p className="text-muted-foreground">No documents submitted yet — the provider has given a CAC number only, or nothing at all.</p> : (
                <div className="space-y-2">{p.documents.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                    <span className="min-w-0">
                      <span className="font-medium">CAC No: {d.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{d.url}</span>
                      <span className="text-xs text-muted-foreground">Submitted {fmtDate(d.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreview({ provider: p, doc: d })}><Eye className="mr-1 h-3.5 w-3.5" />Preview</Button>
                      <Button size="sm" variant="outline" asChild><a href={d.url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Open link</a></Button>
                    </span>
                  </div>
                ))}</div>
              )}
            </div>

            <Textarea placeholder="Admin note (sent back to the provider, e.g. rejection reason)" value={notes[p.id] ?? p.verificationNote ?? ''} onChange={(e) => setNotes({ ...notes, [p.id]: e.target.value })} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={decide.isPending || p.verificationStatus === 'VERIFIED'} onClick={() => decide.mutate({ p, action: 'VERIFIED' })}><CheckCircle2 className="mr-1 h-4 w-4" />Approve verification</Button>
              <Button variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ p, action: 'REJECTED' })}><XCircle className="mr-1 h-4 w-4" />Reject</Button>
              <Button variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ p, action: 'SUSPENDED' })}><ShieldAlert className="mr-1 h-4 w-4" />Suspend</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={Boolean(preview)} onOpenChange={(open) => { if (!open) setPreview(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{preview?.provider.companyName} — document preview</DialogTitle>
            <DialogDescription>CAC No: {preview?.doc.name} · Submitted {fmtDate(preview?.doc.createdAt)}</DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <div className="max-h-[60vh] overflow-auto rounded-lg border bg-muted/30">
                {isPreviewable(preview.doc.url)
                  ? preview.doc.url.toLowerCase().includes('.pdf')
                    ? <iframe title="Verification document" src={preview.doc.url} className="h-[60vh] w-full" />
                    : <img src={preview.doc.url} alt={`Verification document for ${preview.provider.companyName}`} className="mx-auto max-h-[60vh] w-auto object-contain" />
                  : <p className="p-6 text-sm text-muted-foreground">This link can't be previewed inline (not an image or PDF). Open it in a new tab to inspect it.</p>}
              </div>
              <p className="break-all text-xs text-muted-foreground">{preview.doc.url}</p>
              <div className="flex flex-wrap gap-2">
                <Button disabled={decide.isPending} onClick={() => decide.mutate({ p: preview.provider, action: 'VERIFIED' })}><CheckCircle2 className="mr-1 h-4 w-4" />Approve verification</Button>
                <Button variant="outline" asChild><a href={preview.doc.url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-4 w-4" />Open link in new tab</a></Button>
                <Button variant="outline" onClick={() => decide.mutate({ p: preview.provider, action: 'REJECTED' })}>Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(payoutProvider)} onOpenChange={(open) => { if (!open) setPayoutProvider(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Landmark className="h-4 w-4" />Payout bank details — {payoutProvider?.companyName}</DialogTitle>
            <DialogDescription>The provider's full payout account number, exactly as saved on their profile. Handle it as sensitive banking data.</DialogDescription>
          </DialogHeader>
          {payoutProvider && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-muted-foreground">Bank</span><span className="font-semibold uppercase">{payoutProvider.payoutBankName ?? '—'}</span></div>
              <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
                <span className="text-muted-foreground">Account number</span>
                <span className="flex items-center gap-2 font-mono text-base font-semibold">{payoutProvider.payoutAccountNumber ?? '—'}
                  <Button size="sm" variant="ghost" disabled={!payoutProvider.payoutAccountNumber} onClick={() => { void navigator.clipboard?.writeText(payoutProvider.payoutAccountNumber ?? ''); toast.success('Account number copied'); }}><Copy className="h-3.5 w-3.5" /></Button>
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-muted-foreground">Account name</span><span className="font-medium">{payoutProvider.payoutAccountName ?? '—'}</span></div>
              <p className="text-xs text-muted-foreground">Use this account number when sending payouts to {payoutProvider.companyName}. Provider contact: {payoutProvider.businessEmail} · {payoutProvider.phoneNumber}.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
