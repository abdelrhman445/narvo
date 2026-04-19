'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
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

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
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
    fetchProducts(1);
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearch('');
    setFilters({ minPrice: '', maxPrice: '', inStock: false });
  };

  const hasActiveFilters = search || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <div className="text-center mb-14 animate-slide-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
          New arrivals · Free delivery
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground leading-tight mb-4">
          Shop what
          <br />
          <em className="text-primary">matters.</em>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto font-light">
          Curated products, genuine quality, delivered fast.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground hover:border-primary/40'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && !showFilters && (
            <span className="w-2 h-2 bg-white rounded-full" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationFillMode: 'both' }}>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2">Min Price (EGP)</label>
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-2">Max Price (EGP)</label>
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              placeholder="999999"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                  filters.inStock ? 'bg-primary' : 'bg-border'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-foreground">In Stock Only</span>
            </label>
          </div>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading products…</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="font-display text-2xl text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
          <button onClick={clearFilters} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <div
              key={product._id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => fetchProducts(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary/40 transition-colors"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground font-mono">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchProducts(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary/40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
