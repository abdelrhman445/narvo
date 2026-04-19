'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { getProductImage } from '@/lib/utils';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long'),
  address: z
    .string()
    .min(10, 'Please enter a complete address')
    .max(500, 'Address is too long'),
  city: z
    .string()
    .min(2, 'City name is required')
    .max(100, 'City name is too long'),
  phone: z
    .string()
    .regex(
      /^(01)[0125][0-9]{8}$/,
      'Please enter a valid Egyptian mobile number (e.g. 01012345678)'
    ),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) router.replace('/cart');
  }, [items, router]);

  // Sync backend token from NextAuth session into sessionStorage
  useEffect(() => {
    if (session?.backendToken) {
      sessionStorage.setItem('userToken', session.backendToken);
    }
  }, [session]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: session?.user?.name || '',
    },
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const onSubmit = async (formData) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        shippingDetails: {
          address: formData.address,
          phone: formData.phone,
          city: formData.city,
        },
      };

      const { data } = await api.post('/orders/checkout', payload);

      // Clear cart on success
      clearCart();

      // Navigate to success page with order data
      const orderId = data.data.orderId;
      router.push(`/checkout/success?orderId=${orderId}&total=${data.data.totalAmount}`);
    } catch (err) {
      toast.error('Order failed', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-2">Step 2 of 2</p>
        <h1 className="font-display text-4xl text-foreground">Shipping Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                {...register('fullName')}
                placeholder="Ahmed Mohamed"
                className={`w-full px-4 py-3 border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 transition-all ${
                  errors.fullName
                    ? 'border-destructive focus:ring-destructive/30'
                    : 'border-border focus:ring-primary/30 focus:border-primary'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="01012345678"
                dir="ltr"
                className={`w-full px-4 py-3 border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 transition-all font-mono ${
                  errors.phone
                    ? 'border-destructive focus:ring-destructive/30'
                    : 'border-border focus:ring-primary/30 focus:border-primary'
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1.5">⚠ {errors.phone.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Egyptian mobile number (11 digits starting with 010, 011, 012, or 015)</p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                City <span className="text-destructive">*</span>
              </label>
              <input
                {...register('city')}
                placeholder="Cairo"
                className={`w-full px-4 py-3 border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 transition-all ${
                  errors.city
                    ? 'border-destructive focus:ring-destructive/30'
                    : 'border-border focus:ring-primary/30 focus:border-primary'
                }`}
              />
              {errors.city && (
                <p className="text-xs text-destructive mt-1.5">⚠ {errors.city.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full Address <span className="text-destructive">*</span>
              </label>
              <textarea
                {...register('address')}
                placeholder="Street name, building number, floor, apartment..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.address
                    ? 'border-destructive focus:ring-destructive/30'
                    : 'border-border focus:ring-primary/30 focus:border-primary'
                }`}
              />
              {errors.address && (
                <p className="text-xs text-destructive mt-1.5">⚠ {errors.address.message}</p>
              )}
            </div>

            {/* COD notice */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <span className="text-xl">💵</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Cash on Delivery</p>
                <p className="text-xs text-amber-700 mt-0.5">Pay when your order arrives. No online payment required.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order…</>
              ) : (
                <><Lock className="w-4 h-4" /> Place Order · {formatPrice(subtotal)}</>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Your information is secure and encrypted
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <h3 className="font-display text-lg text-foreground mb-4">
              Order Summary ({itemCount} items)
            </h3>

            {/* Items list */}
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-secondary border border-border">
                    <Image
                      src={getProductImage(item.images)}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                  </div>
                  <p className="text-xs font-semibold text-foreground flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Link href="/cart" className="block text-center text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors">
              ← Edit cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
