'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/orders': 'Orders',
  '/finance': 'Finance',
  '/marketing': 'Marketing',
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Admin';

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="font-display text-xl text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
