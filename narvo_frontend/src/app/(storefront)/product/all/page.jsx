'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Loader2, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', inStock: false });
  const [showFilters, setShowFilters] = useState(false);

  // البحث الذكي (Debounce)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNumber, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = true;

      const { data } = await api.get('/products', { params });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearch('');
    setFilters({ minPrice: '', maxPrice: '', inStock: false });
  };

  const hasActiveFilters = search || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen" dir="rtl">

      {/* Header Section */}
      <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-4">
          كل المنتجات
        </h1>
        <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium leading-relaxed">
          استكشف مجموعتنا الكاملة المختارة بعناية، حيث تلتقي الجودة بالتصميم العصري.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md py-4 mb-10 border-y border-zinc-100 flex flex-col md:flex-row gap-4 items-center animate-in fade-in duration-1000">
        <div className="relative w-full flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن قطعة محددة..."
            className="w-full pr-11 pl-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all shadow-inner"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center justify-center gap-2 flex-1 md:flex-initial px-8 py-3.5 rounded-2xl border text-sm font-black transition-all active:scale-95 shadow-sm",
              showFilters || hasActiveFilters
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/20'
                : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-900'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            الفلاتر
            {hasActiveFilters && !showFilters && (
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-3.5 rounded-2xl border border-zinc-200 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
              title="مسح الفلاتر"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block">السعر الأدنى</label>
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">EGP</span>
               <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block">السعر الأقصى</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">EGP</span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                placeholder="9,999"
                className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <label className="flex items-center gap-4 cursor-pointer group bg-white p-3 rounded-2xl border border-zinc-200 hover:border-zinc-900 transition-all">
              <div
                onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative flex-shrink-0 border",
                  filters.inStock ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-200 border-zinc-300'
                )}
              >
                <div className={cn(
                  "absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-300",
                  filters.inStock ? '-translate-x-5' : 'translate-x-0'
                )} />
              </div>
              <span className="text-sm font-black text-zinc-700 group-hover:text-zinc-900 uppercase tracking-tight">المتوفر فقط</span>
            </label>
          </div>
        </div>
      )}

      {/* Results Meta */}
      {!loading && (
        <div className="flex items-center justify-between mb-8 px-2">
          <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            تم العثور على {pagination.total} منتج
          </p>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 text-zinc-900 animate-spin" />
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">تنسيق المنتجات...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200 mx-2 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6 border border-zinc-200">
             <ShoppingBag className="w-10 h-10 text-zinc-300" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tighter">لا توجد نتائج</h3>
          <p className="text-zinc-500 font-medium mb-8 max-w-xs mx-auto">لم نجد ما تبحث عنه، جرب تغيير كلمات البحث أو مسح الفلاتر.</p>
          <button onClick={clearFilters} className="px-10 py-4 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95">
            إعادة ضبط
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 px-2">
          {products.map((product, i) => (
            <div
              key={product._id}
              className="animate-in fade-in slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination UI */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-24">
          <button
            onClick={() => fetchProducts(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-zinc-900 hover:text-zinc-900 transition-all shadow-sm active:scale-95"
          >
             السابق →
          </button>
          
          <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl shadow-zinc-900/10">
            <span className="text-xs font-black text-white">{pagination.page}</span>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">من {pagination.totalPages}</span>
          </div>

          <button
            onClick={() => fetchProducts(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-zinc-900 hover:text-zinc-900 transition-all shadow-sm active:scale-95"
          >
            ← التالي
          </button>
        </div>
      )}
    </div>
  );
}