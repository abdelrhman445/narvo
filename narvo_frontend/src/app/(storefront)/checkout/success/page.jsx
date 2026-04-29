'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Package, Clock } from 'lucide-react';
import { Suspense } from 'react';
import { formatPrice } from '@/lib/utils';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gray-50/30 dark:bg-background transition-colors duration-300" dir="rtl">
      <div className="max-w-xl w-full text-center animate-in fade-in zoom-in duration-700">
        
        {/* Success Icon Animation */}
        <div className="relative inline-flex mb-12">
          <div className="absolute inset-0 bg-emerald-200 dark:bg-emerald-500/20 rounded-full animate-ping opacity-40"></div>
          <div className="relative w-32 h-32 bg-emerald-50 dark:bg-background rounded-full flex items-center justify-center border-8 border-white dark:border-card shadow-2xl shadow-emerald-100/50 dark:shadow-none transition-colors">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl text-foreground font-black mb-4 tracking-tight transition-colors">
          تم تأكيد الطلب بنجاح!
        </h1>
        <p className="text-muted-foreground text-lg mb-12 font-medium max-w-md mx-auto leading-relaxed transition-colors">
          شكراً لتسوقك من نارفو. لقد استلمنا طلبك وبدأ فريقنا في تجهيزه فوراً ليصلك في أسرع وقت.
        </p>

        {orderId && (
          <div className="bg-white dark:bg-card border border-border rounded-[2rem] p-8 mb-8 text-right shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden transition-colors">
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 opacity-80"></div>
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border border-dashed transition-colors">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                فاتورة الطلب
              </p>
              <span className="bg-secondary text-muted-foreground px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-border transition-colors">
                Receipt
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-colors">
                    <Package className="w-4 h-4 text-foreground" />
                  </div>
                  رقم الطلب
                </span>
                <span className="text-base font-mono font-black text-foreground bg-secondary px-4 py-2 rounded-xl border border-border transition-colors">
                  #{orderId.slice(-8).toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground ml-4 transition-colors">المرجع الكامل</span>
                <span className="text-[11px] font-mono text-muted-foreground break-all text-left bg-secondary/50 p-2 rounded-lg border border-border transition-colors">
                  {orderId}
                </span>
              </div>

              {total && (
                <div className="flex items-center justify-between border-t border-border border-dashed pt-6 mt-2 transition-colors">
                  <span className="text-base font-black text-foreground transition-colors">المبلغ الإجمالي</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">{formatPrice(Number(total))}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Method Notice */}
        <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-[2rem] p-8 mb-8 text-right flex items-start gap-5 shadow-sm transition-colors">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-500/20 transition-colors">
            <span className="text-2xl">💵</span>
          </div>
          <div className="pt-1">
            <p className="text-base font-black text-emerald-950 dark:text-emerald-100 transition-colors">الدفع عند الاستلام</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400/80 mt-2 font-medium leading-relaxed transition-colors">
              يرجى تجهيز المبلغ المذكور أعلاه نقداً. سيقوم المندوب بالتواصل معك قريباً لتحديد موعد التسليم.
            </p>
          </div>
        </div>

        {/* Order Status Tracking */}
        <div className="bg-white dark:bg-card border border-border rounded-[2rem] p-8 mb-12 text-right shadow-xl shadow-gray-200/20 dark:shadow-none transition-colors">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8 text-center transition-colors">
            تتبع حالة طلبك
          </p>
          <div className="space-y-8 relative">
            <div className="absolute right-5 top-5 bottom-5 w-0.5 bg-border transition-colors"></div>
            
            {[
              { step: '1', text: 'تم استلام الطلب وتأكيده', active: true, icon: <CheckCircle2 className="w-4 h-4" /> },
              { step: '2', text: 'جاري تجهيز وتغليف المنتجات', active: false },
              { step: '3', text: 'خروج الطلب مع مندوب التوصيل', active: false },
            ].map((s, idx) => (
              <div key={s.step} className="flex items-center gap-6 relative z-10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                  s.active 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 scale-110' 
                    : 'bg-background border-2 border-border text-muted-foreground'
                }`}>
                  {s.active ? s.icon : s.step}
                </div>
                <span className={`text-base font-bold transition-colors ${s.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.text}
                </span>
                {s.active && (
                  <span className="mr-auto text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-black px-3 py-1 rounded-lg animate-pulse uppercase tracking-widest transition-colors">
                    الحالة الحالية
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Return Button */}
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 bg-red-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-red-700 transition-all active:scale-[0.98] shadow-2xl shadow-red-600/20"
        >
          <ShoppingBag className="w-5 h-5" />
          العودة للتسوق
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

function Loader2({ className }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
