import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const styles: Record<string, string> = {
    Created: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
    'Pickup Scheduled': 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900',
    'Picked Up': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900',
    'In Transit': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
    'Out for Delivery': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
    Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Confirmed: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
    Failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
    Queued: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
    Sent: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
    Read: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
    Rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
    Draft: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Inactive: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
    Invited: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
    Connected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
    Disconnected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
  };

  const style = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
        <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold">{message}</h3>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm font-medium text-primary hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
