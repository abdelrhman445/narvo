'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Package } from 'lucide-react';
import { Suspense } from 'react';
import { formatPrice } from '@/lib/utils';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-slide-up">
        {/* Big green checkmark */}
        <div className="relative inline-flex mb-8">
          <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
          </div>
          {/* Ripple rings */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-30" />
        </div>

        <h1 className="font-display text-4xl text-foreground mb-3">
          Order Placed! 🎉
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Thank you for your order. We'll start processing it right away.
        </p>

        {/* Order ID */}
        {orderId && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 text-left">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Order Details
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" /> Order ID
                </span>
                <span className="text-sm font-mono font-bold text-foreground bg-secondary px-2.5 py-1 rounded-lg">
                  #{orderId.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Full reference</span>
                <span className="text-xs font-mono text-muted-foreground break-all text-right max-w-[200px]">
                  {orderId}
                </span>
              </div>
              {total && (
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium text-foreground">Total Paid</span>
                  <span className="text-base font-bold text-primary">{formatPrice(Number(total))}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COD reminder */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">💵</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Cash on Delivery</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Please have the exact amount ready when your order arrives.
              </p>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-8 text-left">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            What happens next?
          </p>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Your order is being reviewed', active: true },
              { step: '2', text: 'Order confirmed & packed', active: false },
              { step: '3', text: 'Out for delivery', active: false },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  s.active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                }`}>
                  {s.step}
                </div>
                <span className={`text-sm ${s.active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {s.text}
                </span>
                {s.active && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
