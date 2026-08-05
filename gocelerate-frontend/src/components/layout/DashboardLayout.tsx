import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const titles: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/projects':   'Projects',
  '/milestones': 'Milestones',
  '/expenses':   'Expenses',
  '/reports':    'Reports',
  '/settings':   'Settings',
};

function getTitle(pathname: string): string {
  if (pathname.startsWith('/projects/') && pathname !== '/projects/new') return 'Project Detail';
  if (pathname === '/projects/new') return 'New Project';
  return titles[pathname] ?? 'Gocelerate';
}

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-[272px] flex flex-col min-h-screen min-w-0">
        <Topbar title={getTitle(pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
