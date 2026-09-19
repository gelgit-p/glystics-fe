import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  User,
  Users,
  Key,
  Webhook,
  Shield,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';

const settingsNav = [
  { to: '/settings', label: 'General', icon: SettingsIcon, exact: true },
  { to: '/settings/profile', label: 'Profile', icon: User },
  { to: '/settings/team', label: 'Team', icon: Users },
  { to: '/settings/api', label: 'API Keys', icon: Key },
  { to: '/settings/webhooks', label: 'Webhooks', icon: Webhook },
  { to: '/settings/security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const location = useLocation();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and organization settings." />
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar nav */}
        <nav className="lg:w-56 shrink-0">
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1">
            {settingsNav.map((item) => {
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
