import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';
import {
  Search,
  Send,
  Mail,
  MailOpen,
  XCircle,
  MessageCircle,
} from 'lucide-react';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NotificationRecord {
  id: string;
  userId: string;
  recipientPhone: string;
  templateName: string;
  templateLanguage: string;
  templateMessage: string | null;
  whatsappMessageId: string | null;
  deliveryTrackingId: string | null;
  sendAt: string | null;
  ReadAt: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = ['all', 'accepted', 'sent', 'delivered', 'read', 'failed'];

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', color)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

export default function NotificationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<NotificationRecord | null>(null);
  const userId = localStorage.getItem('userId');

  const {
    data: notificationRecords = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<NotificationRecord[]>({
    queryKey: ['notifications', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        throw new Error('Logged-in user ID not found.');
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications`,
        { headers: { accept: '*/*' } },
      );
      if (!response.ok) {
        throw new Error('Unable to fetch notifications.');
      }
      const result: unknown = await response.json();
      if (!Array.isArray(result)) {
        throw new Error('Invalid notifications response.');
      }
      return result as NotificationRecord[];
    },
  });

  const normalizedSearch = search.trim().toLowerCase();
  const notifications = notificationRecords.filter((notification) => {
    const matchesSearch =
      !normalizedSearch ||
      [
        notification.recipientPhone,
        notification.templateName,
        notification.deliveryTrackingId,
        notification.templateMessage,
        notification.whatsappMessageId,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    const matchesStatus =
      status === 'all' || notification.status?.toLowerCase() === status;
    return matchesSearch && matchesStatus;
  });
  const countStatus = (value: string) =>
    notificationRecords.filter(
      (notification) => notification.status?.toLowerCase() === value,
    ).length;

  return (
    <div>
      <PageHeader title="Notifications" description="View and track all WhatsApp messages sent to customers." />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Total Sent" value={notificationRecords.length.toLocaleString()} icon={Send} color="bg-primary/10 text-primary" />
        <MiniStat label="Delivered" value={countStatus('delivered').toLocaleString()} icon={Mail} color="bg-blue-50 text-blue-600 dark:bg-blue-950" />
        <MiniStat label="Read" value={countStatus('read').toLocaleString()} icon={MailOpen} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950" />
        <MiniStat label="Failed" value={countStatus('failed').toLocaleString()} icon={XCircle} color="bg-red-50 text-red-600 dark:bg-red-950" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipient, tracking ID, template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => <SelectItem key={s} value={s}>{s === 'all' ? 'All statuses' : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : isError || !userId ? (
          <ErrorState
            message={userId ? 'Unable to load notifications' : 'Logged-in user ID not found'}
            onRetry={userId ? () => void refetch() : undefined}
          />
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No notifications found"
            description="No notifications match your current filters."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient Phone</TableHead>
                <TableHead className="hidden md:table-cell">Template</TableHead>
                <TableHead className="hidden lg:table-cell">Delivery Tracking ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Sent At</TableHead>
                <TableHead className="hidden lg:table-cell">Read At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((n) => (
                <TableRow
                  key={n.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(n)}
                >
                  <TableCell className="font-medium">{n.recipientPhone}</TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">{n.templateName}</TableCell>
                  <TableCell className="hidden font-mono text-xs lg:table-cell">{n.deliveryTrackingId ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={n.status ?? 'unknown'} /></TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {formatDate(n.sendAt)}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(n.ReadAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="overflow-y-auto scrollbar-thin sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Notification Details
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">Status</span>
                  <StatusBadge status={selected.status ?? 'unknown'} />
                </div>

                {/* Database fields */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Notification Record</h4>
                  <div className="rounded-lg border border-border p-3 space-y-3 text-sm">
                    {([
                      ['id', selected.id],
                      ['userId', selected.userId],
                      ['recipientPhone', selected.recipientPhone],
                      ['templateName', selected.templateName],
                      ['templateLanguage', selected.templateLanguage],
                      ['templateMessage', selected.templateMessage],
                      ['whatsappMessageId', selected.whatsappMessageId],
                      ['deliveryTrackingId', selected.deliveryTrackingId],
                      ['sendAt', formatDate(selected.sendAt)],
                      ['ReadAt', formatDate(selected.ReadAt)],
                      ['status', selected.status],
                      ['createdAt', formatDate(selected.createdAt)],
                      ['updatedAt', formatDate(selected.updatedAt)],
                    ] as const).map(([field, value]) => (
                      <div key={field} className="space-y-1">
                        <p className="text-xs text-muted-foreground">{field}</p>
                        <p className="break-all font-medium whitespace-pre-wrap">{value ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
