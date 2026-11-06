import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { aiApi } from '@/lib/ai-api';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/shared';
import { DemoBanner } from './AiShared';

export default function AiInboxPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const list = useQuery({ queryKey: ['ai-conversations'], queryFn: aiApi.conversations });
  const detail = useQuery({ queryKey: ['ai-conversation', selected], queryFn: () => aiApi.conversation(selected!), enabled: !!selected });
  if (list.isLoading) return <LoadingState text="Loading conversations..." />;
  if (list.error) return <ErrorState onRetry={() => list.refetch()} />;
  return (
    <div>
      <PageHeader title="AI Inbox" description="WhatsApp conversations processed by Dispatchly AI. Duplicates are automatically prevented." />
      <DemoBanner />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {list.data?.length ? list.data.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full rounded-lg border bg-card p-3 text-left text-sm ${selected === c.id ? 'ring-2 ring-primary' : ''}`}>
              <p className="font-medium">{c.customerWaId}</p><p className="text-muted-foreground">{c.messages?.[0]?.body ?? 'No messages'} </p><p className="mt-1 text-xs">{c.status} · {new Date(c.updatedAt).toLocaleString()}</p>
            </button>)) : <EmptyState icon={MessageCircle} title="No conversations" description="Inbound WhatsApp messages will appear here." />}
        </div>
        <div className="rounded-lg border bg-card p-4">
          {!selected && <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a conversation to view messages and linked drafts." />}
          {detail.isLoading && <LoadingState />}
          {detail.data && <div className="space-y-3">
            {detail.data.messages.map((m) => <div key={m.id} className={`max-w-[80%] rounded-lg p-3 text-sm ${m.direction === 'INBOUND' ? 'bg-accent' : 'ml-auto bg-primary text-primary-foreground'}`}><p>{m.body ?? '(non-text message)'}</p><p className="mt-1 text-xs opacity-70">{m.processingState} · {new Date(m.createdAt).toLocaleString()}</p></div>)}
            {detail.data.drafts.map((d) => <Link key={d.id} to={`/ai/drafts/${d.id}`} className="block rounded-md border p-2 text-sm">Draft: {d.packageName ?? 'package'} — {d.status} →</Link>)}
          </div>}
        </div>
      </div>
    </div>
  );
}
