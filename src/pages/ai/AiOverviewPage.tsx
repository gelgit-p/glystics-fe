import { Package } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { aiApi } from '@/lib/ai-api';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/shared';
import { DemoBanner } from './AiShared';

export default function AiOverviewPage() {
  const qc = useQueryClient();
  const [demoText, setDemoText] = useState('Please deliver a laptop to Ada Lovelace 08012345678 at 12 Allen Avenue Ikeja Lagos, 2kg, worth 50000, pickup 2026-10-30');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['ai-overview'], queryFn: aiApi.overview });
  const drafts = useQuery({ queryKey: ['ai-drafts'], queryFn: () => aiApi.drafts() });
  const simulate = useMutation({ mutationFn: () => aiApi.simulateInbound(demoText), onSuccess: () => { toast.success('Simulated WhatsApp message processed'); qc.invalidateQueries(); }, onError: (e) => toast.error(e instanceof Error ? e.message : 'Simulation failed') });
  if (isLoading) return <LoadingState text="Loading Dispatchly AI..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div>
      <PageHeader title="Dispatchly AI" description="WhatsApp conversations turned into validated, approved, trackable deliveries." />
      <DemoBanner />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Conversations', data?.conversations ?? 0], ['Delivery drafts', data?.totalDrafts ?? 0], ['Awaiting approval', data?.pendingApprovals ?? 0], ['Audit events', data?.auditEvents ?? 0]].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-3xl font-bold">{v}</p></div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border bg-card p-4">
        <h2 className="font-semibold">Try it (demo simulation)</h2>
        <p className="text-sm text-muted-foreground">Simulates a customer WhatsApp message through the same extraction → draft pipeline as the real webhook.</p>
        <textarea className="mt-3 w-full rounded-md border p-2 text-sm" rows={3} value={demoText} onChange={(e) => setDemoText(e.target.value)} />
        <button className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50" disabled={simulate.isPending} onClick={() => simulate.mutate()}>Simulate WhatsApp message</button>
      </div>
      <h2 className="mb-3 mt-8 font-semibold">Recent drafts</h2>
      {drafts.data?.length ? <div className="space-y-2">{drafts.data.slice(0, 8).map((d) => <Link key={d.id} to={`/ai/drafts/${d.id}`} className="flex justify-between rounded-lg border bg-card p-3 text-sm hover:bg-accent"><span>{d.packageName ?? 'Unnamed package'} → {d.receiverName ?? 'Unknown receiver'}</span><span>{d.status}</span></Link>)}</div> : <EmptyState icon={Package} title="No AI drafts yet" description="Simulate a message above or connect WhatsApp to receive real customer messages." />}
    </div>
  );
}
