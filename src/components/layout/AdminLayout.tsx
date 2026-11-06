import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Bell,
  FileText,
  Zap,
  MessageCircle,
  Bot,
  ChevronLeft,
  ArrowLeftRight,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileBottomNav, MobileSidebar } from './Sidebar';
import { Topbar } from './Topbar';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/deliveries', label: 'Deliveries', icon: Package },
  { to: '/admin/billing', label: 'Billing & Credits', icon: CreditCard },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/templates', label: 'Templates', icon: FileText },
  { to: '/admin/automations', label: 'Automations', icon: Zap },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { to: '/admin/ai', label: 'AI Agents', icon: Bot },
  { to: '/admin/shared-network', label: 'Shared Network', icon: Network },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <aside aria-label="Admin navigation" className={cn('fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex', collapsed ? 'w-[68px]' : 'w-64')}>
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">dispatchly admin</span>
              <span className="text-[10px] text-muted-foreground">Platform controls</span>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {adminNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end as boolean | undefined}
              className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
          <NavLink to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowLeftRight className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>User app</span>}
          </NavLink>
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Toggle sidebar">
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
      </aside>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <MobileBottomNav onMore={() => setMobileOpen(true)} />

      <div className={cn('flex flex-col transition-all duration-300', collapsed ? 'lg:pl-[68px]' : 'lg:pl-64')}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-6 lg:pb-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
