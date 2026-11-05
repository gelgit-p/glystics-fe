import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, CalendarClock, Layers, Users, Package, Coins, CreditCard, Bot, BarChart3, Settings, Network } from 'lucide-react';
import { sharedNetworkApi } from '@/lib/shared-network-api';
import { LoadingState } from '@/components/shared';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/shared-network', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/shared-network/capacity', label: 'Capacity Reservations', icon: Layers },
  { to: '/shared-network/slots', label: 'Delivery Slots', icon: CalendarClock },
  { to: '/shared-network/pools', label: 'Shared Delivery Pools', icon: Users },
  { to: '/shared-network/deliveries', label: 'Deliveries', icon: Package },
  { to: '/shared-network/credits', label: 'Delivery Credits', icon: Coins },
  { to: '/shared-network/billing', label: 'Billing & Subscriptions', icon: CreditCard },
  { to: '/shared-network/ai', label: 'AI Dispatch', icon: Bot },
  { to: '/shared-network/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/shared-network/settings', label: 'Business Settings', icon: Settings },
];

export default function SharedNetworkLayout() {
  const q = useQuery({ queryKey: ['sn-business'], queryFn: sharedNetworkApi.business });
  if (q.isLoading) return <LoadingState text="Loading Shared Delivery Network..." />;
  if (!q.data) return <Navigate to="/shared-network/join" replace />;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Network className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold">Shared Delivery Network</h1><p className="text-sm text-muted-foreground">{q.data.businessName} · {q.data.wallet?.balance ?? 0} credits · {q.data.status}</p></div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px" aria-label="Shared Network">
        {nav.map((i) => <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => cn('flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium', isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}><i.icon className="h-4 w-4" />{i.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
