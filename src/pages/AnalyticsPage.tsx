import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  MailOpen,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { engagementData } from '@/lib/mock-data';
import { PageHeader, LoadingState } from '@/components/shared';
import { cn } from '@/lib/utils';

const dateFilters = ['7 days', '30 days', '90 days'];

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </div>
  );
}

function EngagementCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateFilter, setDateFilter] = useState('30 days');

  const { data: volume, isLoading: volLoading } = useQuery({ queryKey: ['msg-volume'], queryFn: () => api.getMessageVolume() });
  const { data: deliveryRate } = useQuery({ queryKey: ['delivery-rate'], queryFn: () => api.getDeliveryRate() });
  const { data: readRate } = useQuery({ queryKey: ['read-rate'], queryFn: () => api.getReadRate() });
  const { data: breakdown } = useQuery({ queryKey: ['notif-breakdown'], queryFn: () => api.getNotificationBreakdown() });

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Track message performance and customer engagement.">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {dateFilters.map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                dateFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Engagement stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <EngagementCard icon={Clock} label="Average Read Time" value={engagementData.avgReadTime} color="bg-blue-50 text-blue-600 dark:bg-blue-950" />
        <EngagementCard icon={MailOpen} label="Delivery Notification Engagement" value={engagementData.deliveryEngagement} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950" />
        <EngagementCard icon={AlertTriangle} label="Failed Notification Rate" value={engagementData.failedRate} color="bg-red-50 text-red-600 dark:bg-red-950" />
      </div>

      {/* Message volume */}
      <ChartCard title="Message Volume" subtitle="Daily WhatsApp messages sent">
        {volLoading ? (
          <LoadingState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volume}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="sent" name="Sent" stroke="hsl(var(--chart-1))" fill="url(#colorVol)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery rate */}
        <ChartCard title="Delivery Rate" subtitle="Delivered vs failed messages">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={deliveryRate} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {deliveryRate?.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Read rate */}
        <ChartCard title="Read Rate" subtitle="Read vs delivered-only messages">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={readRate} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {readRate?.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Delivery notifications breakdown */}
      <ChartCard title="Delivery Notifications" subtitle="Breakdown by notification type">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="value" name="Messages" radius={[6, 6, 0, 0]}>
              {breakdown?.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
