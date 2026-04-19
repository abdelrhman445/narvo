'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';
import Image from 'next/image';

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const productSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(5000),
  images: z.string().min(1, 'At least one image URL required'),
  price: z.coerce.number().positive('Price must be positive'),
  oldPrice: z.coerce.number().positive().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    register, handleSubmit, reset, setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(productSchema) });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/products', { params: { page, limit: 10 } });
      setProducts(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditProduct(null);
    reset({ title: '', description: '', images: '', price: '', oldPrice: '', stock: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    reset({
      title: product.title,
      description: product.description,
      images: product.images.join('\n'),
      price: product.price,
      oldPrice: product.oldPrice || '',
      stock: product.stock,
      isActive: product.isActive,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        images: data.images.split('\n').map((u) => u.trim()).filter(Boolean),
        oldPrice: data.oldPrice || undefined,
      };

      if (editProduct) {
        await adminApi.put(`/admin/products/${editProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await adminApi.post('/admin/products', payload);
        toast.success('Product created');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Deactivate "${title}"?`)) return;
    try {
      await adminApi.delete(`/admin/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalogue</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">No products found</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">IMG</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1 max-w-[200px]">{p.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{formatPrice(p.price)}</p>
                      {p.oldPrice && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(p.oldPrice)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                        p.stock === 0 ? 'bg-red-100 text-red-700'
                        : p.stock < 10 ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2.5 py-1 rounded-full border ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {p.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.title)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-muted-foreground disabled:opacity-40 hover:text-foreground transition-colors">
              ← Previous
            </button>
            <span className="text-xs font-mono text-muted-foreground">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm text-muted-foreground disabled:opacity-40 hover:text-foreground transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl">{editProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {[
                { name: 'title', label: 'Title', placeholder: 'Product name…' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
                  <input {...register(name)} placeholder={placeholder}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${errors[name] ? 'border-destructive' : 'border-border focus:ring-primary/30'}`}
                  />
                  {errors[name] && <p className="text-xs text-destructive mt-1">{errors[name].message}</p>}
                </div>
              ))}

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Description</label>
                <textarea {...register('description')} rows={3} placeholder="Product description…"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none ${errors.description ? 'border-destructive' : 'border-border focus:ring-primary/30'}`}
                />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Image URLs (one per line)</label>
                <textarea {...register('images')} rows={2} placeholder="https://example.com/image.jpg"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none font-mono ${errors.images ? 'border-destructive' : 'border-border focus:ring-primary/30'}`}
                />
                {errors.images && <p className="text-xs text-destructive mt-1">{errors.images.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'price', label: 'Price (EGP)' },
                  { name: 'oldPrice', label: 'Old Price (opt.)' },
                  { name: 'stock', label: 'Stock' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
                    <input {...register(name)} type="number" step="0.01" min="0"
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${errors[name] ? 'border-destructive' : 'border-border focus:ring-primary/30'}`}
                    />
                    {errors[name] && <p className="text-xs text-destructive mt-1">{errors[name].message}</p>}
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium text-foreground">Active (visible to customers)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
