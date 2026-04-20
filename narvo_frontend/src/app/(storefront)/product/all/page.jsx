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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen transition-colors duration-300" dir="rtl">

      {/* Header Section */}
      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter mb-4">
          All Products
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">
          مجموعتنا الكاملة، مصممة بعناية لتناسب ذوقك الرفيع.
        </p>
      </div>

      {/* ─── Search & Filter Bar (The New Modern Design) ─── */}
      <div className="max-w-4xl mx-auto mb-12 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input Container */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن قطعة محددة..."
              className="w-full pr-12 pl-4 py-4 bg-secondary dark:bg-card border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border text-sm font-black transition-all active:scale-95 shadow-sm",
                showFilters || hasActiveFilters
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground hover:border-primary'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>الفلاتر</span>
              {hasActiveFilters && !showFilters && (
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-4 rounded-2xl border border-border bg-background text-muted-foreground hover:text-destructive hover:border-destructive transition-all active:scale-95 shadow-sm"
                title="مسح الفلاتر"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-8 bg-card border border-border rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-500 shadow-xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">السعر الأدنى</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">EGP</span>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">السعر الأقصى</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">EGP</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-4 cursor-pointer group bg-background p-3.5 rounded-xl border border-border hover:border-primary transition-all">
                <div
                  onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative flex-shrink-0 border",
                    filters.inStock ? 'bg-primary border-primary' : 'bg-muted border-border'
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-white dark:bg-black rounded-full shadow-sm transition-transform duration-300",
                    filters.inStock ? '-translate-x-5' : 'translate-x-0'
                  )} />
                </div>
                <span className="text-xs font-black text-foreground uppercase tracking-tight">المتوفر فقط</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Meta */}
      {!loading && (
        <div className="flex items-center justify-center mb-10">
          <p className="px-4 py-1.5 bg-secondary rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Showing {pagination.total} results
          </p>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">تنسيق المنتجات...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-card rounded-[3rem] border border-dashed border-border mx-2 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mb-6 border border-border">
             <ShoppingBag className="w-10 h-10 text-muted-foreground" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">No Results</h3>
          <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">لم نجد ما تبحث عنه، جرب تغيير كلمات البحث.</p>
          <button onClick={clearFilters} className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl">
            إعادة ضبط
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
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
            className="flex items-center gap-2 px-8 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:border-primary transition-all active:scale-95 shadow-sm"
          >
             السابق
          </button>
          
          <div className="flex items-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 font-black text-xs">
            {pagination.page} / {pagination.totalPages}
          </div>

          <button
            onClick={() => fetchProducts(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center gap-2 px-8 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:border-primary transition-all active:scale-95 shadow-sm"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}