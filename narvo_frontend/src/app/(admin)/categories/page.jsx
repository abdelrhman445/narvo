'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Pencil, Trash2, Loader2, Search, 
  Layers, AlertCircle, X, Hash
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';
import { formatDate } from '@/lib/utils';

// ✅ تعريف الـ Schema للفئة
const categorySchema = z.object({
  name: z.string().min(2, 'اسم الفئة قصير جداً').max(50),
  slug: z.string().min(2, 'الرابط المختصر مطلوب').toLowerCase(),
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
  });

  // ✅ توليد الـ Slug تلقائياً عند كتابة الاسم
  const categoryName = watch('name');
  useEffect(() => {
    if (categoryName && !editCategory) {
      const slug = categoryName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [categoryName, setValue, editCategory]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      toast.error('فشل في تحميل الفئات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditCategory(null);
    reset({ name: '', slug: '' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditCategory(cat);
    reset({ name: cat.name, slug: cat.slug });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editCategory) {
        await adminApi.put(`/admin/categories/${editCategory._id}`, data);
        toast.success('تم تحديث الفئة بنجاح');
      } else {
        await adminApi.post('/admin/categories', data);
        toast.success('تمت إضافة الفئة بنجاح');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`هل أنت متأكد من حذف فئة "${name}"؟`)) return;
    try {
      await adminApi.delete(`/admin/categories/${id}`);
      toast.success('تم الحذف بنجاح');
      fetchCategories();
    } catch (err) {
      toast.error('لا يمكن حذف فئة مرتبطة بمنتجات');
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1500px] w-full text-slate-200" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-2">هيكلة المتجر</p>
          <h1 className="text-3xl font-black text-black tracking-tight">إدارة الفئات</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-6 py-3.5 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400/20"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} /> إضافة فئة جديدة
        </button>
      </div>

      <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-slate-800 gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن فئة..."
              className="w-full pr-12 pl-4 py-3.5 bg-[#020617] border border-slate-700 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            />
          </div>
          <div className="bg-[#020617] px-5 py-2.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">الإجمالي: </span>
            <span className="text-sm font-black text-indigo-400">{filtered.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-[#1e293b] border-b border-slate-700/50">
                {['اسم الفئة', 'الرابط المختصر (Slug)', 'تاريخ الإنشاء', 'إجراءات'].map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[12px] font-black text-slate-300 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-slate-500 font-bold">لا توجد فئات حالياً</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <Layers className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono text-slate-400 bg-[#020617] px-3 py-1 rounded-lg border border-slate-700">/{c.slug}</span>
                    </td>
                    <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(c)} className="p-2.5 text-slate-300 hover:text-indigo-400 bg-slate-800 rounded-xl border border-slate-700 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c._id, c.name)} className="p-2.5 text-slate-300 hover:text-rose-400 bg-slate-800 rounded-xl border border-slate-700 transition-all">
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#0f172a] border border-slate-700 rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b] rounded-t-[2.5rem]">
              <h2 className="text-xl font-black text-white">{editCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#020617] text-slate-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <Field label="اسم الفئة" error={errors.name}>
                <div className="relative">
                  <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    {...register('name')}
                    placeholder="مثل: تشيرتات صيفية"
                    className={`${INPUT_BASE} pr-11 ${errors.name ? INPUT_ERR : INPUT_OK}`}
                  />
                </div>
              </Field>

              <Field label="الرابط المختصر (Slug)" error={errors.slug}>
                <div className="relative">
                  <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    {...register('slug')}
                    placeholder="t-shirts"
                    className={`${INPUT_BASE} pr-11 font-mono ${errors.slug ? INPUT_ERR : INPUT_OK}`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 px-1">يستخدم هذا الرابط في محركات البحث (SEO)</p>
              </Field>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editCategory ? 'حفظ التعديلات' : 'إضافة الفئة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}