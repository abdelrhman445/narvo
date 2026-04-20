'use client';

import { useState, useEffect } from 'react';
import { Layers, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import api from '@/lib/axios'; // نستخدم api العام
import Link from 'next/link';

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 animate-fade-in">
        <Link href="/" className="hover:text-zinc-900 transition-colors">الرئيسية</Link>
        <ChevronLeft className="w-3 h-3" />
        <span className="text-zinc-900">كل الأقسام</span>
      </nav>

      {/* Hero Section - Same as HomePage */}
      <div className="text-center mb-16 animate-slide-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-gray-900 font-black leading-tight mb-4">
          Explore
          <br />
          <em className="text-zinc-600 not-italic text-3xl sm:text-4xl lg:text-5xl">Our Categories</em>
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">
          اختر القسم الذي يناسب احتياجاتك وتصفح مجموعتنا المختارة بعناية من أجلك.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <Link 
            href={`/category/${cat.slug}`} 
            key={cat._id}
            className="group relative bg-white border border-gray-100 p-10 rounded-[2.5rem] overflow-hidden hover:border-zinc-900/20 hover:shadow-2xl hover:shadow-zinc-900/5 transition-all duration-500 animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
          >
            {/* Background Accent */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-zinc-50 rounded-full group-hover:scale-[3] group-hover:bg-zinc-100/50 transition-transform duration-700 ease-in-out" />
            
            <div className="relative z-10">
              {/* Icon Box */}
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-zinc-900/20 group-hover:-translate-y-1 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-zinc-600 transition-colors">
                {cat.name}
              </h2>
              
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 max-w-[200px]">
                استكشف أحدث المنتجات المتاحة الآن في قسم {cat.name}.
              </p>
              
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-900">
                عرض القسم
                <div className="w-8 h-px bg-zinc-200 group-hover:w-12 group-hover:bg-zinc-900 transition-all duration-300" />
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State if no categories */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 animate-fade-in">
          <Layers className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">لا توجد أقسام حالياً</h3>
          <p className="text-gray-500 mt-2 font-medium">نحن نعمل على إضافة أقسام جديدة قريباً.</p>
        </div>
      )}
    </div>
  );
}