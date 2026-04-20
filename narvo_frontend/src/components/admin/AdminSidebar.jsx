'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign,
  Mail, LogOut, ShoppingBag, Menu, X, ChevronLeft, Layers // أضفنا Layers هنا
} from 'lucide-react';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/categories', label: 'Categories', icon: Layers }, // الزر الجديد هنا
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

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full relative">
      
      <div className={cn(
        'relative flex items-center gap-4 px-6 py-8 transition-all duration-300',
        collapsed && 'justify-center px-4'
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-[1rem] bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute inset-0 rounded-[1rem] ring-2 ring-indigo-500/20 animate-pulse pointer-events-none" />
        </div>

        {!collapsed && (
          <div className="min-w-0 text-left">
            <span className="block text-white font-black text-xl tracking-tight leading-none">
              NARVO
            </span>
            <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1.5">
              Admin Panel
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-3 overflow-y-auto custom-scrollbar mt-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'group relative flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300',
                active
                  ? 'bg-slate-800/40 text-indigo-400 border border-slate-700/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent',
                collapsed && 'justify-center px-3'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform duration-300',
                  !active && 'group-hover:scale-110'
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              
              {!collapsed && (
                <span className="relative tracking-wide">{label}</span>
              )}

              {active && !collapsed && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}

              {collapsed && (
                <div className="absolute left-full ml-4 px-4 py-2.5 bg-[#0f172a] text-slate-200 text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-800 shadow-xl">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 mt-auto border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className={cn(
            'group relative flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300',
            collapsed && 'justify-center px-3'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
          
          {!collapsed && <span className="tracking-wide">Logout</span>}

          {collapsed && (
            <div className="absolute left-full ml-4 px-4 py-2.5 bg-[#0f172a] text-rose-400 text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-800 shadow-xl">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full flex-shrink-0 relative transition-all duration-300 ease-in-out bg-[#0f172a] border-r border-slate-800 z-40 shadow-2xl',
          collapsed ? 'w-[100px]' : 'w-[280px]'
        )}
      >
        {renderSidebarContent()}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-10 -right-4 z-50 w-8 h-8 rounded-full bg-[#020617] border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 shadow-xl transition-all hover:scale-110"
        >
          <ChevronLeft
            className={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')}
          />
        </button>
      </aside>

      {/* Floating Action Button for Mobile placed at the bottom */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] p-3.5 rounded-full text-white bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-2xl shadow-indigo-500/30 border border-indigo-400/20 transition-transform hover:scale-105 active:scale-95"
      >
        <Menu className="w-6 h-6" />
      </button>

      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[65] bg-[#020617]/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="lg:hidden fixed inset-y-0 left-0 z-[70] w-[280px] flex flex-col bg-[#0f172a] border-r border-slate-800 shadow-2xl"
            style={{
              animation: 'slideInFromLeft 0.3s ease-out forwards',
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-5 p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700 z-50"
            >
              <X className="w-6 h-6" />
            </button>
            {renderSidebarContent()}
          </aside>
        </>
      )}

      <style jsx global>{`
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}