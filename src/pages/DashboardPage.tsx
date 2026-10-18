import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  CheckCircle,
  Truck,
  XCircle,
  MessageCircle,
  Send,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { deliveryActivityData, currentUser } from '@/lib/mock-data';
import { LoadingState, StatusBadge } from '@/components/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const timeFilters = ['Today', '7 days', '30 days', '90 days'];

interface DashboardAnalytics {
  total_deliveries: number;
  delivered: number;
  in_transit: number;
  failed: number;
  whatsapp_messages: number;
  whatsapp_delivered: number;
  whatsapp_failed: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconClass,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {trend && (
        <div className="mt-1 flex items-center gap-1 text-xs">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-600">{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState('7 days');
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', { limit: 6 }],
    queryFn: () => api.getDeliveries(),
  });
  const analyticsQuery = useQuery<DashboardAnalytics>({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Please sign in again to load dashboard analytics.');
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/delivery/analytics`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!response.ok) {
        throw new Error(`Could not load dashboard analytics (${response.status}).`);
      }
      return response.json() as Promise<DashboardAnalytics>;
    },
  });

  const recent = deliveries?.slice(0, 6) ?? [];
  const stats = analyticsQuery.data;
  const statValue = (value?: number) =>
    analyticsQuery.isLoading ? '—' : (value ?? 0).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, {currentUser.name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your deliveries today.</p>
      </div>

      {/* Delivery stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Deliveries" value={statValue(stats?.total_deliveries)} icon={Package} iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950" />
        <StatCard label="Delivered" value={statValue(stats?.delivered)} icon={CheckCircle} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950" />
        <StatCard label="In Transit" value={statValue(stats?.in_transit)} icon={Truck} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950" />
        <StatCard label="Failed" value={statValue(stats?.failed)} icon={XCircle} iconClass="bg-red-50 text-red-600 dark:bg-red-950" />
      </div>

      {/* WhatsApp stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="WhatsApp Messages" value={statValue(stats?.whatsapp_messages)} icon={MessageCircle} iconClass="bg-primary/10 text-primary" />
        <StatCard label="Delivered (sent)" value={statValue(stats?.whatsapp_delivered)} icon={Send} iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950" />
        <StatCard label="Failed" value={statValue(stats?.whatsapp_failed)} icon={XCircle} iconClass="bg-red-50 text-red-600 dark:bg-red-950" />
      </div>
      {analyticsQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {analyticsQuery.error instanceof Error
            ? analyticsQuery.error.message
            : 'Dashboard analytics could not be loaded.'}
        </p>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Delivery Activity</h2>
            <p className="text-sm text-muted-foreground">Delivery events over time</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {timeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  timeFilter === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={deliveryActivityData}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPickedUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTransit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="created" name="Created" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={2} />
              <Area type="monotone" dataKey="pickedUp" name="Picked Up" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorPickedUp)" strokeWidth={2} />
              <Area type="monotone" dataKey="inTransit" name="In Transit" stroke="hsl(var(--chart-3))" fillOpacity={1} fill="url(#colorTransit)" strokeWidth={2} />
              <Area type="monotone" dataKey="delivered" name="Delivered" stroke="hsl(var(--chart-4))" fillOpacity={1} fill="url(#colorDelivered)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent deliveries */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-base font-semibold">Recent Deliveries</h2>
          <Link to="/deliveries">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last Update</TableHead>
                <TableHead className="hidden lg:table-cell">Notification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs font-medium">{d.trackingId}</TableCell>
                  <TableCell className="font-medium">{d.receiverName}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{d.destination}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {new Date(d.updatedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {d.notifications.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <Send className="h-3 w-3" /> {d.notifications.length} sent
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/deliveries/${d.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
