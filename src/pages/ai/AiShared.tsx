import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/ai-api';
import { StatusBadge } from '@/components/shared';

export function DemoBanner() {
  const { data } = useQuery({ queryKey: ['ai-overview-banner'], queryFn: aiApi.overview, staleTime: 60_000 });
  if (!data || data.aiMode !== 'demo') return null;
  return <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">⚠️ DEMO MODE — AI extraction is simulated (no verified Meta Muse Spark call) and no delivery is real until approved, paid via checkout, and booked by Shipbubble.</div>;
}
export function DraftStatus({ status }: { status: string }) { return <StatusBadge status={status} />; }
export const money = (amount: number, currency: string) => `${currency} ${amount.toLocaleString()}`;
