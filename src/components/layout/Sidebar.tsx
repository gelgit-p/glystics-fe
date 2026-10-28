import { NavLink, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Package,
  Bell,
  MessageSquare,
  Zap,
  Settings,
  CreditCard,
  ChevronLeft,
  MessageCircle,
  LockKeyhole,
  Sparkles,
  Inbox,
  FileText,
  CheckCircle2,
  History,
  Home,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';

function useCreditAccess() {
  const userId = localStorage.getItem('userId') ?? '';
  const accessToken = localStorage.getItem('accessToken') ?? '';
  const { data } = useQuery<{ hasPurchasedCredits: boolean }>({
    queryKey: ['credit-wallet', userId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/credits/wallet`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!response.ok) {
        throw new Error('Unable to check credit access');
      }
      return response.json();
    },
    enabled: Boolean(userId && accessToken),
    staleTime: 15_000,
  });
  return data?.hasPurchasedCredits === true;
}

const CREDIT_LOCKED_ROUTES = [
  '/deliveries',
  '/notifications',
  '/templates',
  '/automations',
  '/whatsapp',
  '/ai',
  '/ai/inbox',
  '/ai/drafts',
  '/ai/approvals',
  '/ai/audit',
];

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/deliveries', label: 'Deliveries', icon: Package },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/templates', label: 'Templates', icon: MessageSquare },
  { to: '/automations', label: 'Automations', icon: Zap },
  { to: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { to: '/ai', label: 'Dispatchly AI', icon: Sparkles },
  { to: '/ai/inbox', label: 'AI Inbox', icon: Inbox },
  { to: '/ai/drafts', label: 'AI Drafts', icon: FileText },
  { to: '/ai/approvals', label: 'AI Approvals', icon: CheckCircle2 },
  { to: '/ai/audit', label: 'AI Audit', icon: History },
  { to: '/billing', label: 'Billing', icon: CreditCard },
];

const bottomTabs = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/deliveries', label: 'Deliveries', icon: Package },
  { to: '/automations', label: 'Automation', icon: Zap },
  { to: '/billing', label: 'Credits', icon: CreditCard },
];

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasPurchasedCredits = useCreditAccess();
  const moreActive = ['/ai', '/whatsapp', '/notifications', '/templates', '/settings'].some((x) => location.pathname.startsWith(x));
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {bottomTabs.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const locked = CREDIT_LOCKED_ROUTES.includes(item.to) && !hasPurchasedCredits;
          return (
            <button key={item.to} type="button" aria-current={active ? 'page' : undefined} aria-label={locked ? `${item.label}, locked. Purchase credits to unlock` : item.label}
              onClick={() => navigate(locked ? '/billing?purchaseRequired=true' : item.to)}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'} ${locked ? 'opacity-50' : ''}`}>
              <span className="relative"><item.icon className="h-5 w-5" />{locked && <LockKeyhole className="absolute -right-2 -top-1 h-3 w-3" />}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
        <button type="button" aria-current={moreActive ? 'page' : undefined} aria-label="More sections" onClick={onMore}
          className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium ${moreActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <MoreHorizontal className="h-5 w-5" /><span>More</span>
        </button>
      </div>
    </nav>
  );
}

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasPurchasedCredits = useCreditAccess();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageCircle className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">dispatchly</span>
            <span className="text-[10px] text-muted-foreground">Logistics Platform</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-3">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const creditLocked = CREDIT_LOCKED_ROUTES.includes(item.to) && !hasPurchasedCredits;
          if (creditLocked) {
            return (
              <button
                key={item.to}
                type="button"
                title="Purchase credits to unlock this page"
                onClick={() => navigate('/billing?purchaseRequired=true')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground opacity-50 transition-colors hover:bg-muted"
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <><span>{item.label}</span><LockKeyhole className="ml-auto h-3.5 w-3.5" /></>}
              </button>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasPurchasedCredits = useCreditAccess();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className="text-sm font-bold">dispatchly</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-3">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
              const creditLocked = CREDIT_LOCKED_ROUTES.includes(item.to) && !hasPurchasedCredits;
            if (creditLocked) {
              return (
                <button
                  key={item.to}
                  type="button"
                  title="Purchase credits to unlock this page"
                  onClick={() => {
                    onClose();
                    navigate('/billing?purchaseRequired=true');
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground opacity-50 transition-colors hover:bg-muted"
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                  <LockKeyhole className="ml-auto h-3.5 w-3.5" />
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Settings className="h-[18px] w-[18px]" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
