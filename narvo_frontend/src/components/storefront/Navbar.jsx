'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import useCartStore from '@/store/cartStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((s) => s.items);

  // التأكد من تحميل المتصفح لتجنب الـ Hydration Errors
  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // حساب عدد منتجات السلة بأمان
  const cartCount = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200'
          : 'bg-white'
      )}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          
          {/* الجانب الأيمن: القوائم */}
          <div className="flex-1 flex items-center justify-start">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                المتجر
              </Link>
            </nav>
            {/* زر القائمة للموبايل (تم نقله لليمين ليكون منطقياً في الـ RTL) */}
            <button
              className="md:hidden p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          <Link 
  href="/" 
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group h-12 w-32 overflow-hidden rounded-full border border-gray-100 bg-black shadow-sm"
>
  <Image 
    src="/logo.png" 
    alt="Narvo Logo" 
    fill
    className="object-cover transition-transform group-hover:scale-105 duration-300" // object-cover بيخلي الصورة تملأ كل المساحة
    priority
  />
</Link>

          {/* الجانب الأيسر: الأزرار والإجراءات */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag
                className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors"
                strokeWidth={2}
              />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none animate-fade-in shadow-sm border-2 border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'المستخدم'}
                      width={22}
                      height={22}
                      className="rounded-full border border-gray-300"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-xs font-bold text-gray-900">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <User className="w-4 h-4" />
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-slide-up px-4 py-4 flex flex-col gap-3 shadow-lg absolute w-full">
          <Link href="/" className="text-sm font-bold text-gray-700 hover:text-zinc-900 py-2 border-b border-gray-50" onClick={() => setMobileOpen(false)}>
            المتجر
          </Link>
          <Link href="/cart" className="text-sm font-bold text-gray-700 hover:text-zinc-900 py-2 border-b border-gray-50" onClick={() => setMobileOpen(false)}>
            سلة المشتريات {cartCount > 0 && <span className="text-red-600">({cartCount})</span>}
          </Link>
          {!session && (
            <button
              onClick={() => { signIn('google'); setMobileOpen(false); }}
              className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3 bg-zinc-900 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform"
            >
              <User className="w-4 h-4" /> الدخول بواسطة جوجل
            </button>
          )}
        </div>
      )}
    </header>
  );
}