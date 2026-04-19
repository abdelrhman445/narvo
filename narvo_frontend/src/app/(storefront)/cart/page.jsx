'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Trash2, ShoppingCart } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { toast } from 'sonner';
import useCartStore from '@/store/cartStore';
import CartItem from '@/components/storefront/CartItem';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    if (!session) {
      toast.info('Sign in required', { description: 'Please sign in with Google to checkout.' });
      signIn('google', { callbackUrl: '/checkout' });
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" strokeWidth={1} />
        </div>
        <h2 className="font-display text-4xl text-foreground mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-foreground">Your Cart</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {itemCount} item{itemCount !== 1 ? 's' : ''} · {formatPrice(subtotal)}
          </p>
        </div>
        <button
          onClick={() => { clearCart(); toast.success('Cart cleared'); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6">
            {items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h3 className="font-display text-xl text-foreground mb-5">Order Summary</h3>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-xl text-foreground">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all active:scale-95 animate-pulse-glow"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {!session && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                You'll be asked to sign in before checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
