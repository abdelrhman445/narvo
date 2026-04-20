'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Pencil, Trash2, Loader2, Search, 
  ToggleLeft, ToggleRight, Package, ImagePlus, AlertCircle, X, Layers 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';
import Image from 'next/image';

// ✅ تحديث السكيما لإضافة الفئة
const productSchema = z.object({
  title: z.string().min(2, 'الاسم قصير جداً').max(200),
  description: z.string().min(10, 'الوصف قصير جداً').max(5000),
  category: z.string().min(1, 'يجب اختيار فئة للمنتج'), // حقل الفئة الجديد
  images: z.any(),
  price: z.coerce.number().positive('السعر يجب أن يكون أكبر من الصفر'),
  oldPrice: z.coerce.number().positive().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0, 'الكمية لا يمكن أن تكون سالبة'),
  isActive: z.boolean().default(true),
});

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-slate-300 uppercase tracking-widest mb-2.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] font-bold text-rose-400 mt-2 flex items-center gap-1.5 px-1">
          <AlertCircle className="w-3 h-3" /> {error.message || error}
        </p>
      )}
    </div>
  );
}

const INPUT_BASE = 'w-full px-4 py-3.5 rounded-2xl text-sm border outline-none transition-all focus:ring-2 bg-[#020617] text-white placeholder-slate-500';
const INPUT_OK = 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-600';
const INPUT_ERR = 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // حالة الفئات
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  });

  // ✅ جلب الفئات من السيرفر
  const fetchCategories = async () => {
    try {
      const { data } = await adminApi.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

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

  useEffect(() => { 
    fetchProducts(); 
    fetchCategories(); // جلب الفئات عند التحميل
  }, [fetchProducts]);

  const openCreate = () => {
    setEditProduct(null);
    setImageFiles([]);
    setPreviews([]);
    reset({ title: '', description: '', category: '', images: '', price: '', oldPrice: '', stock: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setImageFiles([]);
    setPreviews(product.images || []);
    reset({
      title: product.title,
      description: product.description,
      category: product.category?._id || product.category || '', // تعبئة الفئة المختارة
      images: product.images ? product.images.join('\n') : '',
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
      let finalImages = [];
      if (data.images instanceof FileList && data.images.length > 0) {
        const filePromises = Array.from(data.images).map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });
        });
        finalImages = await Promise.all(filePromises);
      } 
      else if (typeof data.images === 'string' && data.images.trim() !== '') {
        finalImages = data.images.split('\n').map((u) => u.trim()).filter(Boolean);
      } 
      else if (previews.length > 0) {
        finalImages = previews;
      }

      const payload = {
        title: data.title,
        description: data.description,
        category: data.category, // إرسال الفئة للسيرفر
        price: Number(data.price),
        stock: Number(data.stock),
        isActive: Boolean(data.isActive),
        images: finalImages,
      };

      if (data.oldPrice && data.oldPrice !== '') {
        payload.oldPrice = Number(data.oldPrice);
      }

      if (editProduct) {
        await adminApi.put(`/admin/products/${editProduct._id}`, payload);
        toast.success('تم تحديث بيانات المنتج بنجاح');
      } else {
        await adminApi.post('/admin/products', payload);
        toast.success('تمت إضافة المنتج بنجاح');
      }
      
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء الحفظ';
      toast.error('فشل في العملية', { description: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`هل أنت متأكد من تعطيل/حذف "${title}"؟`)) return;
    try {
      await adminApi.delete(`/admin/products/${id}`);
      toast.success('تم الحذف بنجاح');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1500px] w-full text-slate-200" dir="rtl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-2">إدارة المنتجات</p>
          <h1 className="text-3xl font-black text-black tracking-tight">المنتجات</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-6 py-3.5 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400/20"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} /> إضافة منتج جديد
        </button>
      </div>

      <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-slate-800 gap-4 bg-[#0f172a]">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full pr-12 pl-4 py-3.5 bg-[#020617] border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-3 bg-[#020617] px-5 py-2.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">العدد الكلي</span>
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">{filtered.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar bg-[#0f172a]">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-[#1e293b] border-b border-slate-700/50">
                {['المنتج', 'الفئة', 'السعر', 'المخزون', 'الحالة', 'تاريخ الإضافة', 'إجراءات'].map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[12px] font-black text-slate-300 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-24">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">جاري تحميل البيانات...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-24">
                    <div className="w-16 h-16 bg-[#020617] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                      <Package className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-base font-bold text-slate-300">لا توجد منتجات مطابقة</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="relative w-14 h-14 rounded-[1rem] overflow-hidden bg-[#020617] flex-shrink-0 border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px] font-black tracking-widest">IMG</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate max-w-[200px] group-hover:text-indigo-400 transition-colors">{p.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono tracking-widest mt-1.5 uppercase">#{p._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>

                    {/* ✅ عرض اسم الفئة في الجدول */}
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest">
                        {p.category?.name || 'عام'}
                      </span>
                    </td>

                    <td className="px-8 py-5">
                      <p className="text-base font-black text-white">{formatPrice(p.price)}</p>
                      {p.oldPrice && (
                        <p className="text-[11px] font-bold text-slate-400 line-through mt-1">{formatPrice(p.oldPrice)}</p>
                      )}
                    </td>

                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center justify-center min-w-[3rem] text-[12px] font-black px-4 py-2 rounded-xl border tracking-tight ${
                        p.stock === 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                        : p.stock < 10 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {p.stock}
                      </span>
                    </td>

                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-2 text-[11px] font-black px-3.5 py-2 rounded-xl border tracking-widest uppercase ${
                        p.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[#020617] text-slate-400 border-slate-700'
                      }`}>
                        {p.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {p.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                      {formatDate(p.createdAt)}
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2.5 text-slate-300 hover:text-indigo-400 bg-slate-800 hover:bg-indigo-500/20 rounded-xl border border-slate-700 hover:border-indigo-500/30 transition-all shadow-sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.title)}
                          className="p-2.5 text-slate-300 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/20 rounded-xl border border-slate-700 hover:border-rose-500/30 transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <div className="flex items-center justify-between px-8 py-6 border-t border-slate-800 bg-[#0f172a]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-[12px] font-black tracking-widest uppercase text-slate-300 disabled:opacity-30 hover:text-indigo-400 transition-colors px-5 py-2.5 rounded-xl hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/20 disabled:border-transparent disabled:hover:bg-transparent"
            >
              السابق
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">صفحة</span>
              <span className="text-sm font-black text-white bg-[#020617] px-4 py-1.5 rounded-lg border border-slate-700 shadow-inner">{page}</span>
              <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">من {totalPages}</span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-[12px] font-black tracking-widest uppercase text-slate-300 disabled:opacity-30 hover:text-indigo-400 transition-colors px-5 py-2.5 rounded-xl hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/20 disabled:border-transparent disabled:hover:bg-transparent"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Modal / Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir="rtl">
          <div
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md transition-opacity"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="relative bg-[#0f172a] border border-slate-700 rounded-[2rem] shadow-2xl shadow-black w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b] rounded-t-[2rem]">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {editProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1.5">
                  {editProduct ? `تعديل: ${editProduct.title.slice(0, 30)}` : 'قم بتعبئة تفاصيل المنتج لرفعه للمتجر'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#020617] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              
              <Field label="اسم المنتج" error={errors.title}>
                <input
                  {...register('title')}
                  placeholder="مثال: سماعات لاسلكية برو..."
                  className={`${INPUT_BASE} ${errors.title ? INPUT_ERR : INPUT_OK}`}
                />
              </Field>

              {/* ✅ حقل اختيار الفئة الجديد */}
              <Field label="تصنيف المنتج" error={errors.category}>
                <div className="relative group">
                   <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                   <select
                    {...register('category')}
                    className={`${INPUT_BASE} pr-11 appearance-none cursor-pointer ${errors.category ? INPUT_ERR : INPUT_OK}`}
                   >
                    <option value="" className="bg-[#0f172a]">اختر فئة للمنتج...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id} className="bg-[#0f172a]">
                        {cat.name}
                      </option>
                    ))}
                   </select>
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="border-l border-t border-slate-500 w-2 h-2 -rotate-45" />
                   </div>
                </div>
              </Field>

              <Field label="وصف المنتج" error={errors.description}>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="اكتب وصفاً جذاباً وتفصيلياً للمنتج..."
                  className={`${INPUT_BASE} resize-none ${errors.description ? INPUT_ERR : INPUT_OK}`}
                />
              </Field>

              {/* Upload Image Section */}
              <Field label="صور المنتج" error={errors.images}>
                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setImageFiles(files);
                        setPreviews(files.map(f => URL.createObjectURL(f)));
                        setValue('images', e.target.files);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`${INPUT_BASE} ${errors.images ? INPUT_ERR : INPUT_OK} flex flex-col items-center justify-center py-10 border-dashed border-2 bg-[#020617] group-hover:bg-slate-900 group-hover:border-indigo-500/60 transition-all`}>
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all shadow-lg">
                        <ImagePlus className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-white">اضغط لرفع صور المنتج</p>
                    </div>
                  </div>

                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-4 pt-2">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl border border-slate-600 overflow-hidden bg-[#020617]">
                          <img src={src} alt="preview" className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="السعر الأساسي" error={errors.price}>
                  <input
                    {...register('price')}
                    type="number" step="0.01"
                    placeholder="0.00"
                    className={`${INPUT_BASE} font-mono ${errors.price ? INPUT_ERR : INPUT_OK}`}
                  />
                </Field>
                <Field label="السعر القديم" error={errors.oldPrice}>
                  <input
                    {...register('oldPrice')}
                    type="number" step="0.01"
                    placeholder="اختياري"
                    className={`${INPUT_BASE} font-mono ${errors.oldPrice ? INPUT_ERR : INPUT_OK}`}
                  />
                </Field>
                <Field label="المخزون" error={errors.stock}>
                  <input
                    {...register('stock')}
                    type="number"
                    placeholder="0"
                    className={`${INPUT_BASE} font-mono ${errors.stock ? INPUT_ERR : INPUT_OK}`}
                  />
                </Field>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-4 cursor-pointer group bg-[#020617] p-5 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors shadow-inner">
                  <div className="relative">
                    <input type="checkbox" {...register('isActive')} className="sr-only peer" />
                    <div className="w-12 h-6 bg-slate-800 border border-slate-600 rounded-full peer-checked:bg-emerald-500 transition-all" />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-slate-300 rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-white" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">تفعيل المنتج</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-4 border border-slate-700 bg-slate-800 rounded-[1.25rem] text-sm font-bold text-white hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 text-white rounded-[1.25rem] text-sm font-black transition-all disabled:opacity-70 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:shadow-indigo-500/40 shadow-xl"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
                  ) : (
                    editProduct ? 'حفظ التعديلات' : 'نشر المنتج'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}