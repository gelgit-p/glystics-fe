import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CalendarCheck, Package, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/shared';
import { fmtDate, logisticsProviderApi, naira, titleCase, type AnyRecord } from '@/lib/logistics-provider-api';

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <Card><CardContent className="py-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></CardContent></Card>;
}

export default function LogisticsOverviewPage() {
  const q = useQuery({ queryKey: ['lp-overview'], queryFn: logisticsProviderApi.overview });
  if (q.isLoading) return <LoadingState text="Loading provider overview..." />;
  if (q.isError || !q.data) return <EmptyState icon={Package} title="No provider profile yet" description="Create your provider profile first — then publish capacity, zones and start receiving reservations." action={<Link className="text-sm font-medium text-primary hover:underline" to="/logistics-provider/profile">Set up provider profile</Link>} />;
  const s = q.data.stats; const perf = q.data.deliveryPerformance;
  return (
    <div className="space-y-6">
      <PageHeader title="Provider overview" description={`${q.data.provider.companyName} · Verification: ${titleCase(q.data.provider.verificationStatus)}`} />
      {(q.data.alerts ?? []).length > 0 && <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4" />Notifications & operational alerts</CardTitle></CardHeader><CardContent className="space-y-2">{q.data.alerts.map((a: AnyRecord, i: number) => <p key={i} className="text-sm text-muted-foreground">{a.message}</p>)}</CardContent></Card>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total published capacity" value={s.totalPublishedCapacity} />
        <Stat label="Available capacity" value={s.availableCapacity} />
        <Stat label="Reserved capacity" value={s.reservedCapacity} />
        <Stat label="Capacity in use" value={s.capacityInUse} />
        <Stat label="Total reservations" value={s.totalReservations} />
        <Stat label="Pending reservations" value={s.pendingReservations} />
        <Stat label="Confirmed reservations" value={s.confirmedReservations} />
        <Stat label="Active deliveries" value={s.activeDeliveries} />
        <Stat label="Completed deliveries" value={s.completedDeliveries} />
        <Stat label="Cancelled reservations" value={s.cancelledReservations} />
        <Stat label="Total earnings" value={naira(s.totalEarningsKobo)} />
        <Stat label="Pending payouts" value={naira(s.pendingPayoutsKobo)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">Capacity utilization</CardTitle></CardHeader><CardContent className="space-y-3">
          {(q.data.capacityUtilization ?? []).slice(0, 5).map((c: AnyRecord) => <div key={c.title} className="space-y-1"><div className="flex justify-between text-sm"><span>{c.title}</span><span>{c.reserved}/{c.total}</span></div><Progress value={c.total ? (c.reserved / c.total) * 100 : 0} /></div>)}
          {(q.data.capacityUtilization ?? []).length === 0 && <p className="text-sm text-muted-foreground">No capacity published yet.</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Reservations over time</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={180}><LineChart data={q.data.reservationsOverTime ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Line type="monotone" dataKey="count" stroke="#2563eb" /></LineChart></ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Delivery performance</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={180}><BarChart data={[{ name: 'Delivered', value: perf.delivered }, { name: 'Failed', value: perf.failed }, { name: 'Active', value: perf.active }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="value" fill="#16a34a" /></BarChart></ResponsiveContainer>
          <p className="mt-2 text-sm text-muted-foreground">Delivered {perf.delivered} · Failed {perf.failed} · On-time performance tracked per shipment.</p>
        </CardContent></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarCheck className="h-4 w-4" />Recent reservations</CardTitle></CardHeader><CardContent className="space-y-3">{(q.data.recentReservations ?? []).map((r: AnyRecord) => <div key={r.id} className="flex items-center justify-between gap-2 text-sm"><span>{r.reference} · {r.businessName} · {r.quantity} pkgs</span><StatusBadge status={titleCase(r.status)} /></div>)}{(q.data.recentReservations ?? []).length === 0 && <p className="text-sm text-muted-foreground">No reservations yet.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4" />Recent shipment activity</CardTitle></CardHeader><CardContent className="space-y-3">{(q.data.recentShipments ?? []).map((r: AnyRecord) => <div key={r.id} className="flex items-center justify-between gap-2 text-sm"><span>{r.reference} · {r.receiverName}</span><StatusBadge status={titleCase(r.status)} /></div>)}{(q.data.recentShipments ?? []).length === 0 && <p className="text-sm text-muted-foreground">No shipments yet.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4" />Upcoming delivery windows</CardTitle></CardHeader><CardContent className="space-y-3">{(q.data.upcomingWindows ?? []).map((c: AnyRecord) => <div key={c.id} className="text-sm"><span className="font-medium">{c.title}</span><span className="text-muted-foreground"> · {fmtDate(c.deliveryDate)} · {c.availableCapacity} available</span></div>)}{(q.data.upcomingWindows ?? []).length === 0 && <p className="text-sm text-muted-foreground">No upcoming windows.</p>}</CardContent></Card>
      </div>
    </div>
  );
}
