'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { ShoppingBag, User, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import useCartStore from '@/store/cartStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle'; 

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((s) => s.items);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartCount = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-white dark:bg-background'
      )}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          
          {/* الجانب الأيمن: القوائم */}
          <div className="flex-1 md:flex-1 flex items-center justify-start z-10">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                المتجر
              </Link>
            </nav>
            {/* زر القائمة للموبايل */}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* اللوجو */}
<Link 
  href="/" 
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full border border-border bg-black shadow-sm z-0"
>
  <Image 
    src="/logo.png" 
    alt="Narvo Logo" 
    fill
    className="object-contain p-1.5 transition-transform group-hover:scale-105 duration-300"
    priority
  />
</Link>

          {/* الجانب الأيسر: الأزرار والإجراءات */}
          <div className="flex-1 md:flex-1 flex items-center justify-end gap-1 sm:gap-3 z-10">
            <ThemeToggle />
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors group"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag
                className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
                strokeWidth={2}
              />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center leading-none shadow-sm border-2 border-white dark:border-background">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'المستخدم'}
                      width={22}
                      height={22}
                      className="rounded-full border border-border"
                    />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-bold text-foreground">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                <User className="w-4 h-4" />
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Mobile Dropdown - Optimized & Smooth */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full z-40 md:hidden">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 top-[64px] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu Content - انيميشن واحد سلس للقائمة ككل */}
          <nav className="relative bg-black border-t border-b border-zinc-900 px-6 py-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ease-out">
            
            <div className="flex flex-col gap-5">
              {/* رابط المتجر */}
              <Link 
                href="/" 
                className="group flex items-center justify-between"
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-2xl font-black italic tracking-tight text-white group-hover:text-zinc-400 transition-colors">
                  SHOP
                </span>
                <ArrowLeft className="w-5 h-5 text-zinc-800 -rotate-45 group-hover:rotate-0 group-hover:text-white transition-all duration-300" />
              </Link>

              {/* رابط السلة */}
              <Link 
                href="/cart" 
                className="group flex items-center justify-between"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex flex-col">
                  <span className="text-2xl font-black italic tracking-tight text-white group-hover:text-zinc-400 transition-colors">
                    CART
                  </span>
                  {cartCount > 0 && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">
                      {cartCount} Items
                    </span>
                  )}
                </div>
                <ArrowLeft className="w-5 h-5 text-zinc-800 -rotate-45 group-hover:rotate-0 group-hover:text-white transition-all duration-300" />
              </Link>
            </div>

            {/* خط فاصل */}
            <div className="h-px bg-zinc-900 w-full" />

            {/* الجزء السفلي: الدخول أو معلومات المستخدم */}
            <div>
              {!session ? (
                <button
                  onClick={() => { signIn('google'); setMobileOpen(false); }}
                  className="w-full py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" /> Login with Google
                </button>
              ) : (
                <div className="flex items-center justify-between bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-zinc-700 overflow-hidden relative">
                      <Image src={session.user?.image} alt="User" fill className="object-cover" />
                    </div>
                    <span className="text-xs font-bold text-white">{session.user?.name?.split(' ')[0]}</span>
                  </div>
                  <button onClick={() => signOut()} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer المنيو */}
            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.4em] text-center mt-1 opacity-50">
              NARVO STREETWEAR
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}
