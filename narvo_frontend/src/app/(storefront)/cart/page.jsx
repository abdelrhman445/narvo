'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { toast } from 'sonner';
import useCartStore from '@/store/cartStore';
import CartItem from '@/components/storefront/CartItem';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    if (!session) {
      toast.info('مطلوب تسجيل الدخول', { description: 'يرجى تسجيل الدخول لإتمام الدفع.' });
      signIn('google', { callbackUrl: '/checkout' });
      return;
    }
    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] transition-colors duration-300">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-fade-in transition-colors duration-300" dir="rtl">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8 border border-border shadow-inner transition-colors">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-3xl text-foreground font-bold mb-4">سلة المشتريات فارغة</h2>
        <p className="text-muted-foreground mb-10 text-lg font-medium transition-colors">يبدو أنك لم تضف أي منتجات إلى سلتك بعد، ابدأ باكتشاف أحدث المنتجات الآن.</p>
        <Link href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/10 active:scale-95">
          <ShoppingBag className="w-5 h-5" /> اكتشف المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-border transition-colors">
        <div>
          <h1 className="font-display text-4xl text-foreground font-black mb-2 tracking-tight">سلة المشتريات</h1>
          <p className="text-muted-foreground text-base font-medium transition-colors">
            لديك <span className="text-foreground font-bold">{itemCount}</span> {itemCount === 1 ? 'عنصر' : 'عناصر'} جاهزة للدفع
          </p>
        </div>
        <button 
          onClick={() => { clearCart(); toast.success('تم إفراغ السلة بنجاح'); }} 
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-destructive transition-colors bg-secondary px-4 py-2 rounded-xl border border-border"
        >
          <Trash2 className="w-4 h-4" /> إفراغ السلة بالكامل
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Products List */}
        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-[2rem] p-4 sm:p-8 shadow-sm transition-colors">
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          </div>
          
          <Link href="/" className="inline-flex items-center gap-2 mt-8 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:translate-x-1" /> 
            العودة للتسوق
          </Link>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-[2rem] p-8 sticky top-28 shadow-xl shadow-black/5 dark:shadow-none transition-colors">
            <h3 className="text-xl font-bold text-foreground mb-8 pb-4 border-b border-border transition-colors">ملخص الطلب</h3>
            
            <div className="space-y-5 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold transition-colors">الإجمالي الفرعي</span>
                <span className="font-bold text-foreground transition-colors">{formatPrice(subtotal)}</span>
              </div>
              
              
              <div className="pt-5 mt-5 border-t border-border flex justify-between items-center transition-colors">
                <span className="font-bold text-foreground text-lg">الإجمالي</span>
                <span className="font-black text-3xl text-foreground tracking-tight transition-colors">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-primary-foreground rounded-[1.25rem] font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
            >
              متابعة الدفع <ArrowLeft className="w-5 h-5" />
            </button>

            {!session && (
              <div className="mt-6 flex items-center justify-center gap-2 p-4 bg-secondary rounded-2xl border border-border transition-colors">
                <p className="text-xs font-bold text-muted-foreground text-center">
                  يرجى تسجيل الدخول أولاً لإكمال عملية الشراء
                </p>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-3 gap-4 opacity-30 grayscale group-hover:grayscale-0 transition-all">
              {/* أيقونات وسائل الدفع */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}