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
    <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300" dir="rtl">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8 animate-fade-in">
        <Link href="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
        <ChevronLeft className="w-3 h-3" />
        <span className="text-foreground">كل الأقسام</span>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-16 animate-slide-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground font-black leading-tight mb-4 transition-colors">
          Explore
          <br />
          <em className="text-muted-foreground not-italic text-3xl sm:text-4xl lg:text-5xl transition-colors">Our Categories</em>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium transition-colors">
          اختر القسم الذي يناسب احتياجاتك وتصفح مجموعتنا المختارة بعناية من أجلك.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <Link 
            href={`/category/${cat.slug}`} 
            key={cat._id}
            className="group relative bg-card border border-border p-10 rounded-[2.5rem] overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
          >
            {/* Background Accent - الدائرة الخلفية أصبحت أهدأ */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary rounded-full group-hover:scale-[3] group-hover:bg-secondary/80 transition-transform duration-700 ease-in-out" />
            
            <div className="relative z-10">
              {/* Icon Box - يسحب من اللون الأساسي (أبيض في الدارك) */}
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/10 group-hover:-translate-y-1 transition-transform">
                <Layers className="w-6 h-6 text-primary-foreground transition-colors" />
              </div>
              
              <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight group-hover:text-muted-foreground transition-colors">
                {cat.name}
              </h2>
              
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 max-w-[200px] transition-colors">
                استكشف أحدث المنتجات المتاحة الآن في قسم {cat.name}.
              </p>
              
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground transition-colors">
                عرض القسم
                <div className="w-8 h-px bg-border group-hover:w-12 group-hover:bg-primary transition-all duration-300" />
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State if no categories */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-secondary rounded-[3rem] border border-dashed border-border animate-fade-in transition-colors">
          <Layers className="w-12 h-12 text-muted-foreground/50 mb-4 transition-colors" />
          <h3 className="text-xl font-bold text-foreground transition-colors">لا توجد أقسام حالياً</h3>
          <p className="text-muted-foreground mt-2 font-medium transition-colors">نحن نعمل على إضافة أقسام جديدة قريباً.</p>
        </div>
      )}
    </div>
  );
}