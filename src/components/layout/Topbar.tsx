import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch as fetch } from '@/lib/authenticated-fetch';
import { toast } from 'sonner';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  User,
  Settings as SettingsIcon,
  Building2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';

interface UserDetails {
  fullName: string;
  email: string;
  businessName: string;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/deliveries': 'Deliveries',
  '/notifications': 'Notifications',
  '/templates': 'Templates',
  '/automations': 'Automations',
  '/whatsapp': 'WhatsApp',
  '/billing': 'Billing',
  '/settings': 'Settings',
  '/settings/profile': 'Settings · Profile',
  '/settings/team': 'Settings · Team',
  '/settings/api': 'Settings · API Keys',
  '/settings/webhooks': 'Settings · Webhooks',
  '/settings/security': 'Settings · Security',
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const userId = localStorage.getItem('userId') ?? '';
  const { data: user } = useQuery<UserDetails>({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        { headers: { accept: '*/*' } },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch profile: ${response.status} ${response.statusText}`,
        );
      }
      const data: unknown = await response.json();
      if (
        typeof data !== 'object' ||
        data === null ||
        !('fullName' in data) ||
        typeof data.fullName !== 'string' ||
        !('email' in data) ||
        typeof data.email !== 'string' ||
        !('businessName' in data) ||
        typeof data.businessName !== 'string'
      ) {
        throw new Error('The profile response is invalid');
      }
      return {
        fullName: data.fullName,
        email: data.email,
        businessName: data.businessName,
      };
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
  const fullName = user?.fullName || 'Account';
  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A';

  const signOut = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch {
      toast.error('The session could not be invalidated on the server.');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      navigate('/login');
    }
  };

  const getPageTitle = () => {
    const path = window.location.pathname;
    return pageTitles[path] || 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden text-lg font-semibold sm:block">{getPageTitle()}</h1>

      <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deliveries, contacts..."
          className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-3">
        <div className="hidden max-w-56 items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium sm:flex">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{user?.businessName || 'Business'}</span>
        </div>

        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.businessName || ''}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <SettingsIcon className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
