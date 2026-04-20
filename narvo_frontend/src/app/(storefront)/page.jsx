'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link'; // أضفنا Link للتنقل
import ProductCard from '@/components/storefront/ProductCard';
import api from '@/lib/axios';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', inStock: false });
  const [showFilters, setShowFilters] = useState(false);

  // تأخير البحث (Debounce)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // تم تغيير الـ limit لـ 3 فقط كما طلبت
      const params = { page: 1, limit: 3 }; 
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = true;

      const { data } = await api.get('/products', { params });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearch('');
    setFilters({ minPrice: '', maxPrice: '', inStock: false });
  };

  const hasActiveFilters = search || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">

      {/* Hero Section */}
      <div className="text-center mb-14 animate-slide-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-gray-900 font-black leading-tight mb-4">
          Top Selling
          <br />
          <em className="text-zinc-600 not-italic">On Narvo</em>
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">
           اكتشف أفضل المنتجات مبيعًا على موقعنا.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن المنتجات..."
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
        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">لم يتم العثور على منتجات</h3>
          <button onClick={clearFilters} className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold">مسح الفلاتر</button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Grid showing only 3 products */}
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

          {/* زر "عرض الكل" في المنتصف */}
          <div className="flex justify-center pt-8">
            <Link 
  href="/product/all" // جرب دي لو الفولدر عندك اسمه product
  className="group flex items-center gap-3 px-10 py-4 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95"
>
  عرض الكل
  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
</Link>
          </div>
        </div>
      )}
    </div>
  );
}