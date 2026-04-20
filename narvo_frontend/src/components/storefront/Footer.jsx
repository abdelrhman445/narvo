'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center mb-12">
          {/* Logo - الستايل الجديد (الكبسولة السوداء) */}
          <Link 
            href="/" 
            className="group relative h-12 w-32 overflow-hidden rounded-full border border-gray-100 bg-black shadow-sm transition-all hover:shadow-md flex items-center justify-center mb-6"
          >
            <Image 
              src="/logo.png" 
              alt="Narvo Logo" 
              fill
              className="object-cover transition-transform group-hover:scale-105 duration-300"
              priority
            />
          </Link>
          
          <p className="text-gray-400 text-sm font-medium max-w-xs text-center leading-relaxed">
            نسق حياتك بأسلوب نارفو. جودة استثنائية وتصاميم تليق بك.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pb-12 border-b border-gray-50 relative">
          
          {/* Navigation - تم تعديل "تواصل معنا" للواتساب */}
          <nav className="flex flex-wrap justify-center gap-8 md:gap-12">
            <Link href="/" className="text-sm font-black text-gray-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">
              المتجر
            </Link>
            <Link href="/cart" className="text-sm font-black text-gray-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">
              السلة
            </Link>
            {/* رابط الواتساب بالرقم المختار */}
            <a 
              href="https://wa.me/201065235834" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-black text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
            >
              تواصل معنا
            </a>
          </nav>

          
        </div>

        {/* Bottom Bar */}
<div className="pt-8 flex flex-col items-center justify-center gap-4">
  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">
    © {new Date().getFullYear()} Narvo. جميع الحقوق محفوظة.
  </p>
</div>

      </div>
    </footer>
  );
}