import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className={`flex flex-col transition-all duration-300 ${collapsed ? 'lg:pl-[68px]' : 'lg:pl-64'}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
