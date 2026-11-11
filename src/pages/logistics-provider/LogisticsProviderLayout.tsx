import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Layers, MapPin, CalendarCheck, Package, Users, Wallet, Building2, Store } from 'lucide-react';
import { canAccessLogisticsProvider, logisticsProviderApi } from '@/lib/logistics-provider-api';
import { LoadingState } from '@/components/shared';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/logistics-provider', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/logistics-provider/capacity', label: 'Capacity', icon: Layers },
  { to: '/logistics-provider/zones', label: 'Delivery Zones', icon: MapPin },
  { to: '/logistics-provider/reservations', label: 'Reservations', icon: CalendarCheck },
  { to: '/logistics-provider/shipments', label: 'Shipments', icon: Package },
  { to: '/logistics-provider/fleet', label: 'Fleet', icon: Users },
  { to: '/logistics-provider/earnings', label: 'Earnings', icon: Wallet },
  { to: '/logistics-provider/marketplace', label: 'Marketplace', icon: Store },
  { to: '/logistics-provider/profile', label: 'Profile & Verification', icon: Building2 },
];

export default function LogisticsProviderLayout() {
  const q = useQuery({ queryKey: ['lp-profile'], queryFn: logisticsProviderApi.profile });
  if (!canAccessLogisticsProvider()) return <Navigate to="/dashboard" replace />;
  if (q.isLoading) return <LoadingState text="Loading Logistics Provider dashboard..." />;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Package className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold">Logistics Provider</h1>
            <p className="text-sm text-muted-foreground">{q.data ? `${q.data.companyName} · Verification: ${q.data.verificationStatus}` : 'Complete your provider profile to start publishing capacity.'}</p>
          </div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px" aria-label="Logistics Provider">
        {nav.map((i) => <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => cn('flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium', isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}><i.icon className="h-4 w-4" />{i.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
