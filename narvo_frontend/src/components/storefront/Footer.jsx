'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-background border-t border-gray-100 dark:border-border pt-16 pb-8 transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center mb-12">
          {/* Logo - الستايل الجديد (الدائرة السوداء) */}
<Link 
  href="/" 
  className="group relative mb-6"
>
  <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-black shadow-xl border-2 border-white/10 overflow-hidden flex items-center justify-center">
    <Image 
      src="/logo.png" 
      alt="Narvo Logo" 
      width={64}
      height={64}
      className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-300"
      priority
    />
  </div>
</Link>
          
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium max-w-xs text-center leading-relaxed transition-colors">
            نسق حياتك بأسلوب نارفو. جودة استثنائية وتصاميم تليق بك.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pb-12 border-b border-gray-50 dark:border-slate-800/60 relative transition-colors">
          
          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-8 md:gap-12">
            <Link href="/" className="text-sm font-black text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              المتجر
            </Link>
            <Link href="/cart" className="text-sm font-black text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              السلة
            </Link>
            
            {/* ✅ الرابط الجديد: كل الأقسام */}
            <Link href="/category" className="text-sm font-black text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              كل الأقسام
            </Link>

            <a 
              href="https://wa.me/201065235834" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-black text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-widest"
            >
              تواصل معنا
            </a>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center transition-colors">
            © {new Date().getFullYear()} Narvo. جميع الحقوق محفوظة.
          </p>
        </div>

      </div>
    </footer>
  );
}
