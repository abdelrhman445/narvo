'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', desc: 'Overview of your store' },
  '/products': { title: 'Products', desc: 'Manage your catalogue' },
  '/orders': { title: 'Orders', desc: 'Track & fulfill orders' },
  '/finance': { title: 'Finance', desc: 'Revenue & ledger' },
  '/marketing': { title: 'Marketing', desc: 'Email campaigns' },
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] || { title: 'Admin', desc: '' };
  
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    // تحديث الوقت كل ثانية لتعمل كساعة حية
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="h-[72px] flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60 shadow-sm">
      
      {/* Left: breadcrumb / title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-white tracking-tight">
            {meta.title}
          </h2>
          {meta.desc && (
            <>
              <span className="text-slate-700 font-black text-base">/</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">
                {meta.desc}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: time + avatar */}
      <div className="flex items-center gap-4">
        
        {/* Current time (Live) */}
        {mounted ? (
          <div className="hidden md:flex flex-col items-end justify-center px-2">
            <span className="text-[12px] font-black text-slate-200 font-mono tracking-widest">
              {timeStr}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-1">
              {dateStr}
            </span>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-end justify-center px-2 opacity-0">
            <span className="text-[12px] font-black text-slate-200 font-mono tracking-widest">00:00 AM</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-1">XXX, XXX 00</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-slate-800 mx-1 rounded-full" />

        {/* Avatar Profile (Pill Shape Hover) */}
        <div className="flex items-center gap-3 cursor-pointer group p-1 pl-4 hover:bg-slate-800/40 rounded-full transition-all duration-300 border border-transparent hover:border-slate-700/50">
          <div className="hidden sm:block text-right">
            <p className="text-[12px] font-bold text-white leading-none group-hover:text-indigo-400 transition-colors">
              Admin
            </p>
            <p className="text-[9px] font-black text-slate-500 mt-1.5 uppercase tracking-widest">
              Super Admin
            </p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20 bg-gradient-to-br from-indigo-500 to-indigo-600 border-2 border-[#020617] group-hover:scale-105 transition-transform duration-300">
            A
          </div>
        </div>
        
      </div>
    </header>
  );
}