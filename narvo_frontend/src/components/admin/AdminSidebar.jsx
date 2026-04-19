'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign,
  Mail, LogOut, ShoppingBag, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/marketing', label: 'Marketing', icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    Cookies.remove('AdminToken');
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-display text-lg block leading-none">Bazaar</span>
            <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Admin</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'admin-nav-item',
                active
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('p-3 border-t border-white/10', collapsed && 'flex justify-center')}>
        <button
          onClick={handleLogout}
          className={cn(
            'admin-nav-item text-white/50 hover:text-red-400 hover:bg-red-500/10 w-full',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full bg-[hsl(220,25%,10%)] border-r border-white/5 transition-all duration-300 flex-shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
        >
          <Menu className="w-3 h-3" />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[hsl(220,25%,10%)] rounded-lg text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(220,25%,10%)] flex flex-col animate-slide-in-right">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
