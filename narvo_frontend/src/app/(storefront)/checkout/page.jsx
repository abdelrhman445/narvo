'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck, Lock, AlertCircle, Banknote, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import useCartStore from '@/store/cartStore';
import api from '@/lib/axios';
import { formatPrice, getProductImage } from '@/lib/utils';

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل').max(100),
  address: z.string().min(10, 'يرجى إدخال عنوان كامل بالتفصيل').max(500),
  city: z.string().min(2, 'اسم المدينة مطلوب').max(100),
  phone: z.string().regex(/^(01)[0125][0-9]{8}$/, 'يرجى إدخال رقم موبايل مصري صحيح'),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (status !== 'loading' && items.length === 0 && !isSuccess) {
      router.replace('/cart');
    }
  }, [items, router, status, isSuccess]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: session?.user?.name || '',
    },
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const onSubmit = async (formData) => {
    if (submitting) return;

    if (!session?.backendToken) {
      toast.error('جلسة العمل منتهية', { 
        description: 'يرجى تسجيل الخروج والدخول مرة أخرى لربط حسابك.' 
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        shippingDetails: {
          address: formData.address,
          phone: formData.phone,
          city: formData.city,
          fullName: formData.fullName
        },
      };

      const { data } = await api.post('/orders/checkout', payload, {
        headers: {
          Authorization: `Bearer ${session.backendToken}`
        }
      });

      setIsSuccess(true);
      
      const orderId = data.data.orderId;
      const totalAmount = data.data.totalAmount;

      clearCart();
      toast.success('تم تسجيل الطلب بنجاح');
      router.push(`/checkout/success?orderId=${orderId}&total=${totalAmount}`);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'فشل في إتمام الطلب';
      toast.error('خطأ في العملية', { description: errorMsg });
      setSubmitting(false);
    }
  };

  if (status === 'loading' || (items.length === 0 && !isSuccess)) {
    return (
      <div className="min-h-[70vh] flex flex-col gap-4 items-center justify-center transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-foreground" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Processing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors" dir="rtl">
      
      {!session?.backendToken && (
        <div className="mb-10 p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-700 dark:text-rose-400 shadow-sm animate-pulse transition-colors">
          <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0 transition-colors">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight">تنبيه أمني: الحساب غير مصادق</p>
            <p className="text-xs font-medium mt-1 text-rose-600 dark:text-rose-400/80">يرجى إعادة تسجيل الدخول لضمان إتمام طلبك بنجاح وبدون أخطاء.</p>
          </div>
        </div>
      )}

      <div className="mb-12 flex items-end justify-between border-b border-border pb-6 transition-colors">
        <div>
          <span className="inline-block px-3 py-1 bg-secondary text-muted-foreground rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 transition-colors">
            Secure Checkout
          </span>
          <h1 className="text-4xl lg:text-5xl text-foreground font-black tracking-tight transition-colors">إتمام الطلب</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-7 xl:col-span-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl shadow-gray-200/20 dark:shadow-none transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3 transition-colors">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-sm transition-colors">1</span>
                تفاصيل الشحن
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 transition-colors">الاسم بالكامل</label>
                  <input
                    {...register('fullName')}
                    placeholder="الاسم ثلاثي كما في البطاقة"
                    className={`w-full px-5 py-4 border-2 rounded-2xl text-sm bg-background hover:bg-secondary focus:bg-background text-foreground focus:outline-none transition-all ${
                      errors.fullName ? 'border-rose-200 dark:border-rose-900/50 focus:border-rose-500' : 'border-border focus:border-red-500'
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] font-bold text-rose-500 mt-2 px-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 transition-colors">رقم الهاتف</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className={`w-full px-5 py-4 border-2 rounded-2xl text-sm bg-background hover:bg-secondary focus:bg-background text-foreground focus:outline-none transition-all text-right font-mono ${
                      errors.phone ? 'border-rose-200 dark:border-rose-900/50 focus:border-rose-500' : 'border-border focus:border-red-500'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] font-bold text-rose-500 mt-2 px-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 transition-colors">المدينة</label>
                  <input
                    {...register('city')}
                    placeholder="المحافظة / المدينة"
                    className={`w-full px-5 py-4 border-2 rounded-2xl text-sm bg-background hover:bg-secondary focus:bg-background text-foreground focus:outline-none transition-all ${
                      errors.city ? 'border-rose-200 dark:border-rose-900/50 focus:border-rose-500' : 'border-border focus:border-red-500'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] font-bold text-rose-500 mt-2 px-1">{errors.city.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 transition-colors">العنوان بالتفصيل</label>
                  <textarea
                    {...register('address')}
                    placeholder="رقم المبنى، اسم الشارع، رقم الشقة، أو أي علامات مميزة لتسهيل الوصول..."
                    rows={4}
                    className={`w-full px-5 py-4 border-2 rounded-2xl text-sm bg-background hover:bg-secondary focus:bg-background text-foreground focus:outline-none transition-all resize-none ${
                      errors.address ? 'border-rose-200 dark:border-rose-900/50 focus:border-rose-500' : 'border-border focus:border-red-500'
                    }`}
                  />
                  {errors.address && <p className="text-[10px] font-bold text-rose-500 mt-2 px-1">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl shadow-gray-200/20 dark:shadow-none transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3 transition-colors">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-sm transition-colors">2</span>
                طريقة الدفع
              </h3>
              
              <div className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 transition-colors" />
                <div className="relative flex items-center gap-5 border-2 border-emerald-500 rounded-2xl p-6 bg-background shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:shadow-none cursor-pointer transition-colors">
                  <div className="w-6 h-6 rounded-full border-4 border-emerald-500 bg-background flex items-center justify-center shrink-0 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Banknote className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground transition-colors">الدفع نقداً عند الاستلام</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium transition-colors">سيتم تحصيل المبلغ عند تسليم الطلب لباب منزلك.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full relative group overflow-hidden bg-red-600 text-white rounded-[1.5rem] py-5 font-bold text-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-2xl shadow-red-600/20 hover:bg-red-700 hover:shadow-red-600/40"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <div className="relative flex items-center justify-center gap-3">
                  {submitting ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> جاري التأكيد...</>
                  ) : (
                    <><Lock className="w-5 h-5" /> تأكيد الطلب بقيمة {formatPrice(subtotal)}</>
                  )}
                </div>
              </button>
              <p className="flex items-center justify-center gap-2 mt-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                معاملة آمنة ومشفرة بالكامل
              </p>
            </div>

          </form>
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-secondary/50 border border-border rounded-[2.5rem] p-8 sticky top-28 shadow-xl shadow-gray-200/20 dark:shadow-none transition-colors">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border transition-colors">
              <h3 className="text-xl font-black text-foreground flex items-center gap-3 transition-colors">
                <ShoppingBag className="w-5 h-5" /> ملخص السلة
              </h3>
              <span className="bg-card border border-border px-3 py-1 rounded-full text-xs font-bold text-red-600 dark:text-red-400 transition-colors">
                {itemCount} عناصر
              </span>
            </div>
            
            <div className="space-y-6 mb-8 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
              {items.map((item) => (
                <div key={item._id} className="flex gap-5 group">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-background border border-border shadow-sm group-hover:border-red-500 transition-colors">
                    <Image
                      src={getProductImage(item.images)}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-background shadow-sm z-10 transition-colors">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug transition-colors">{item.title}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">{formatPrice(item.price)} / للقطعة</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 transition-colors">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4 transition-colors">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold uppercase tracking-widest text-[11px] transition-colors">المجموع الفرعي</span>
                <span className="font-bold text-foreground transition-colors">{formatPrice(subtotal)}</span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-border border-dashed flex justify-between items-end transition-colors">
                <div>
                  <span className="block text-foreground font-black text-lg transition-colors">الإجمالي المالي</span>
                  <span className="block text-[10px] text-muted-foreground font-bold mt-1 transition-colors">شامل ضريبة القيمة المضافة</span>
                </div>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter transition-colors">{formatPrice(subtotal)}</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
