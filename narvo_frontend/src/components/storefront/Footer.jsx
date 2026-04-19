import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-lg text-foreground">Bazaar</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bazaar. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Shop</Link>
            <Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
