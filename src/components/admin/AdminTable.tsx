import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingState, EmptyState, ErrorState, StatusBadge } from '@/components/shared';
import { Inbox, Search } from 'lucide-react';

export function AdminSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function AdminPager({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-muted-foreground">Page {page} of {pages} · {total} total</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

// Returns null when there are items to display — callers must branch on
// isLoading/error/items, never on this element's truthiness (JSX is always truthy).
export function DataState({ isLoading, error, items, refetch, emptyTitle, emptyHint }: {
  isLoading: boolean; error: unknown; items: unknown[] | undefined; refetch: () => void; emptyTitle: string; emptyHint: string;
}) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => refetch()} />;
  if (!items?.length) return <EmptyState icon={Inbox} title={emptyTitle} description={emptyHint} />;
  return null;
}

export { StatusBadge };
