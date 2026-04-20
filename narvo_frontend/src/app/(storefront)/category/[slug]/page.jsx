'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Loader2, ChevronLeft, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/storefront/ProductCard'; // تأكد إن المسار ده صح عندك
import api from '@/lib/axios'; // بنستخدم الـ API العام

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // حالات الفلترة والبحث
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', inStock: false });
  const [showFilters, setShowFilters] = useState(false);

  // تأخير البحث (Debounce)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCategoryProducts = useCallback(async () => {
    setLoading(true);
    try {
      // تجهيز المتغيرات للباك إيند
      const params = { category: slug }; 
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = true;

      const { data } = await api.get('/products', { params });
      
      // ✅ الحل النهائي والجذري لمشكلة (map is not a function)
      // بنتأكد إن الداتا مصفوفة (Array) 100% سواء كانت جوه data.data أو data مباشرة
      const productsArray = Array.isArray(data?.data) 
        ? data.data 
        : (Array.isArray(data) ? data : []);
        
      setProducts(productsArray);

      // جلب اسم الفئة عشان نعرضه في العنوان (من أول منتج لو موجود)
      if (productsArray.length > 0 && productsArray[0].category) {
        setCategory(productsArray[0].category);
      }
    } catch (err) {
      console.error("Error fetching category products:", err);
      setProducts([]); // لو حصل إيرور نديها مصفوفة فاضية عشان الصفحة متضربش
    } finally {
      setLoading(false);
    }
  }, [slug, debouncedSearch, filters]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  const clearFilters = () => {
    setSearch('');
    setFilters({ minPrice: '', maxPrice: '', inStock: false });
  };

  const hasActiveFilters = search || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 animate-fade-in">
        <Link href="/" className="hover:text-zinc-900 transition-colors">الرئيسية</Link>
        <ChevronLeft className="w-3 h-3" />
        <Link href="/category" className="hover:text-zinc-900 transition-colors">الأقسام</Link>
        <ChevronLeft className="w-3 h-3" />
        <span className="text-zinc-900">{category?.name || slug}</span>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-14 animate-slide-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-gray-900 font-black leading-tight mb-4">
          {category?.name || slug}
          <br />
          <em className="text-zinc-600 not-italic text-4xl">Collection</em>
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">
           تصفح أحدث المنتجات المتوفرة في قسم {category?.name || slug} واكتشف ما يناسبك.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`ابحث داخل ${category?.name || slug}...`}
            className="w-full pr-11 pl-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold transition-all shadow-sm active:scale-95 ${
            showFilters || hasActiveFilters
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white border-gray-200 text-gray-700 hover:border-zinc-400 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          الفلاتر
          {hasActiveFilters && !showFilters && (
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
          >
            <X className="w-4 h-4" /> مسح
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up shadow-sm" style={{ animationFillMode: 'both' }}>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2">السعر الأدنى (ج.م)</label>
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2">السعر الأقصى (ج.م)</label>
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              placeholder="99999"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 border ${
                  filters.inStock ? 'bg-zinc-900 border-zinc-900' : 'bg-gray-200 border-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${filters.inStock ? '-translate-x-6' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-zinc-900 transition-colors">عرض المتوفر فقط</span>
            </label>
          </div>
        </div>
      )}

      {/* Products Section */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 border border-gray-200 shadow-sm">
             <PackageOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">لا توجد منتجات مطابقة</h3>
          <p className="text-gray-500 mb-6 font-medium">جرب إزالة الفلاتر أو البحث بكلمات أخرى.</p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition-all">مسح الفلاتر</button>
          ) : (
            <Link href="/" className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition-all">العودة للرئيسية</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <div
              key={product._id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}