import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Layers, LockKeyhole, MapPin, CalendarCheck, Package, Users, Wallet, Building2, Store } from 'lucide-react';
import { canAccessLogisticsProvider, logisticsProviderApi } from '@/lib/logistics-provider-api';
import { EmptyState, LoadingState } from '@/components/shared';
import { Hint } from '@/components/ui/hint';
import { cn } from '@/lib/utils';

// Sections locked while verification is REJECTED or SUSPENDED — only Overview and Profile stay usable.
export const LOCKED_VERIFICATION_STATUSES = ['REJECTED', 'SUSPENDED'] as const;
export const isVerificationLocked = (status?: string | null) => (LOCKED_VERIFICATION_STATUSES as readonly string[]).includes(status ?? '');
export const REJECTED_LOCKED_ROUTES = [
  '/logistics-provider/capacity',
  '/logistics-provider/zones',
  '/logistics-provider/reservations',
  '/logistics-provider/shipments',
  '/logistics-provider/fleet',
  '/logistics-provider/earnings',
  '/logistics-provider/marketplace',
];
export const SUSPENDED_LOCKED_ROUTES = REJECTED_LOCKED_ROUTES;

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
  const navigate = useNavigate();
  const location = useLocation();
  const q = useQuery({ queryKey: ['lp-profile'], queryFn: logisticsProviderApi.profile });
  if (!canAccessLogisticsProvider()) return <Navigate to="/dashboard" replace />;
  if (q.isLoading) return <LoadingState text="Loading Logistics Provider dashboard..." />;
  const rejected = q.data?.verificationStatus === 'REJECTED';
  const suspended = q.data?.verificationStatus === 'SUSPENDED';
  const verificationLocked = rejected || suspended;
  const lockedHere = verificationLocked && REJECTED_LOCKED_ROUTES.some((r) => location.pathname.startsWith(r));
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
      {verificationLocked && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Your provider verification is <strong>{suspended ? 'suspended' : 'rejected'}</strong>{q.data?.verificationNote ? <> — {q.data.verificationNote}</> : ''}. Capacity, Delivery Zones, Reservations, Shipments, Fleet, Earnings and Marketplace are disabled {suspended ? 'while your account is suspended by Dispatchly — please contact Dispatchly support to resolve this.' : 'until Dispatchly approves a new submission.'} Review your details under <button type="button" className="font-medium underline" onClick={() => navigate('/logistics-provider/profile')}>Profile &amp; Verification</button>.
        </p>
      )}
      <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px" aria-label="Logistics Provider">
        {nav.map((i) => {
          const locked = verificationLocked && REJECTED_LOCKED_ROUTES.includes(i.to);
          if (locked) {
            return (
              <Hint key={i.to} label={suspended ? 'Disabled — verification suspended by Dispatchly.' : 'Disabled — verification rejected. Resubmit your documents in Profile & Verification.'} className="shrink-0">
                <button type="button" disabled aria-disabled="true" className="flex cursor-not-allowed items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  <i.icon className="h-4 w-4" />{i.label}<LockKeyhole className="h-3.5 w-3.5" />
                </button>
              </Hint>
            );
          }
          return <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => cn('flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium', isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}><i.icon className="h-4 w-4" />{i.label}</NavLink>;
        })}
      </nav>
      {lockedHere
        ? <EmptyState icon={LockKeyhole} title={suspended ? 'Section disabled — verification suspended' : 'Section disabled — verification rejected'} description={suspended ? 'This section is unavailable while your provider account is suspended. Please contact Dispatchly support.' : 'This section unlocks once Dispatchly approves your verification. Please update your profile and resubmit your CAC document.'} action={<button type="button" className="text-sm font-medium text-primary hover:underline" onClick={() => navigate('/logistics-provider/profile')}>Go to Profile & Verification</button>} />
        : <Outlet />}
    </div>
  );
}
