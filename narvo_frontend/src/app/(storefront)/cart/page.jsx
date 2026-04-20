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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-fade-in" dir="rtl">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-inner">
          <ShoppingCart className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-3xl text-gray-900 font-bold mb-4">سلة المشتريات فارغة</h2>
        <p className="text-gray-500 mb-10 text-lg font-medium">يبدو أنك لم تضف أي منتجات إلى سلتك بعد، ابدأ باكتشاف أحدث المنتجات الآن.</p>
        <Link href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-zinc-900/20 active:scale-95">
          <ShoppingBag className="w-5 h-5" /> اكتشف المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="font-display text-4xl text-gray-900 font-black mb-2 tracking-tight">سلة المشتريات</h1>
          <p className="text-gray-500 text-base font-medium">
            لديك <span className="text-zinc-900 font-bold">{itemCount}</span> {itemCount === 1 ? 'عنصر' : 'عناصر'} جاهزة للدفع
          </p>
        </div>
        <button 
          onClick={() => { clearCart(); toast.success('تم إفراغ السلة بنجاح'); }} 
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-xl"
        >
          <Trash2 className="w-4 h-4" /> إفراغ السلة بالكامل
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Products List */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-4 sm:p-8 shadow-sm">
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          </div>
          
          <Link href="/" className="inline-flex items-center gap-2 mt-8 text-sm font-bold text-gray-500 hover:text-zinc-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:translate-x-1" /> 
            العودة للتسوق
          </Link>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 sticky top-28 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-50">ملخص الطلب</h3>
            
            <div className="space-y-5 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">الإجمالي الفرعي</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">رسوم الشحن</span>
                <span className="text-emerald-600 font-black uppercase tracking-wider text-xs">مجاني</span>
              </div>
              
              <div className="pt-5 mt-5 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">الإجمالي</span>
                <span className="font-black text-3xl text-zinc-900 tracking-tight">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              className="w-full flex items-center justify-center gap-3 py-5 bg-zinc-900 text-white rounded-[1.25rem] font-bold text-lg hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-zinc-900/10 hover:shadow-zinc-900/20"
            >
              متابعة الدفع <ArrowLeft className="w-5 h-5" />
            </button>

            {!session && (
              <div className="mt-6 flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 text-center">
                  يرجى تسجيل الدخول أولاً لإكمال عملية الشراء
                </p>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-3 gap-4 opacity-40 grayscale group-hover:grayscale-0 transition-all">
              {/* أيقونات صغيرة لوسائل الدفع أو الأمان ممكن تضيفها هنا */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}