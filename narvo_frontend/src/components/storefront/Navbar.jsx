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

  // Hydration-safe cart count
  const [cartCount, setCartCount] = useState(0);
  const items = useCartStore((s) => s.items);
  useEffect(() => {
    setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
  }, [items]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-background'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
              <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-normal text-foreground tracking-tight">
              Bazaar
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Shop
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors group"
              aria-label="Shopping cart"
            >
              <ShoppingBag
                className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
                strokeWidth={1.5}
              />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none animate-fade-in px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={22}
                      height={22}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium text-foreground">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign in
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up px-4 py-4 flex flex-col gap-3">
          <Link href="/" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
            Shop
          </Link>
          <Link href="/cart" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          {!session && (
            <button
              onClick={() => { signIn('google'); setMobileOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg"
            >
              <User className="w-4 h-4" /> Sign in with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
}
