import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Send,
  Mail,
  MailOpen,
  XCircle,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle as XIcon,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { dashboardStats } from '@/lib/mock-data';
import { PageHeader, StatusBadge, LoadingState, EmptyState } from '@/components/shared';
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
import type { Notification } from '@/types';

const statusOptions = ['all', 'Queued', 'Sent', 'Delivered', 'Read', 'Failed'];

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
  const [selected, setSelected] = useState<Notification | null>(null);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', { search, status }],
    queryFn: () => api.getNotifications({ search, status }),
  });

  return (
    <div>
      <PageHeader title="Notifications" description="View and track all WhatsApp messages sent to customers." />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Total Sent" value={dashboardStats.whatsappMessages.toLocaleString()} icon={Send} color="bg-primary/10 text-primary" />
        <MiniStat label="Delivered" value={dashboardStats.whatsappDelivered.toLocaleString()} icon={Mail} color="bg-blue-50 text-blue-600 dark:bg-blue-950" />
        <MiniStat label="Read" value={dashboardStats.whatsappRead.toLocaleString()} icon={MailOpen} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950" />
        <MiniStat label="Failed" value={dashboardStats.whatsappFailed.toLocaleString()} icon={XCircle} color="bg-red-50 text-red-600 dark:bg-red-950" />
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
                <TableHead>Recipient</TableHead>
                <TableHead className="hidden md:table-cell">Template</TableHead>
                <TableHead className="hidden lg:table-cell">Delivery</TableHead>
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
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{n.recipient}</span>
                      <span className="text-xs text-muted-foreground">{n.recipientPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">{n.template}</TableCell>
                  <TableCell className="hidden font-mono text-xs lg:table-cell">{n.trackingId}</TableCell>
                  <TableCell><StatusBadge status={n.status} /></TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {new Date(n.sentAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {n.readAt ? new Date(n.readAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
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
                  <StatusBadge status={selected.status} />
                </div>

                {/* Recipient */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Recipient</h4>
                  <div className="rounded-lg border border-border p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{selected.recipient}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{selected.recipientPhone}</span></div>
                  </div>
                </div>

                {/* Template */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Template & Message</h4>
                  <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="font-mono text-xs font-medium">{selected.template}</span></div>
                    <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">{selected.templateBody}</div>
                  </div>
                </div>

                {/* Parameters */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Message Parameters</h4>
                  <div className="rounded-lg border border-border p-3 space-y-1.5 text-sm">
                    {Object.entries(selected.parameters).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{`{{${k}}}`}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Delivery</h4>
                  <div className="rounded-lg border border-border p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Tracking ID</span><span className="font-mono text-xs font-medium">{selected.trackingId}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp Message ID</span><span className="font-mono text-xs">{selected.whatsappMessageId}</span></div>
                  </div>
                </div>

                {/* Status timeline */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Status Timeline</h4>
                  <div className="rounded-lg border border-border p-3 space-y-3">
                    {[
                      { label: 'Queued', time: selected.sentAt, icon: Clock, done: true },
                      { label: 'Sent', time: selected.sentAt, icon: Send, done: selected.status !== 'Queued' },
                      { label: 'Delivered', time: selected.deliveredAt, icon: CheckCircle, done: !!selected.deliveredAt },
                      { label: 'Read', time: selected.readAt, icon: MailOpen, done: !!selected.readAt },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-3">
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', t.done ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-muted text-muted-foreground')}>
                          <t.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className={cn('text-sm font-medium', t.done ? 'text-foreground' : 'text-muted-foreground')}>{t.label}</p>
                          {t.time && t.done && (
                            <p className="text-xs text-muted-foreground">{new Date(t.time).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {selected.error && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Error Information</h4>
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <p className="text-sm text-red-700 dark:text-red-300">{selected.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
