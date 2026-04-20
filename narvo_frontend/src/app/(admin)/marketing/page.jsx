'use client';

import { useState } from 'react';
import { Send, Loader2, Mail, CheckCircle2, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';

const broadcastSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  html: z.string().min(10, 'Email body too short').max(100000),
});

const INPUT_BASE = 'w-full px-5 py-4 rounded-2xl text-sm font-bold border bg-[#020617] text-white placeholder-slate-500 outline-none transition-all focus:ring-2 shadow-inner';
const INPUT_OK = 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-600';
const INPUT_ERR = 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20';

export default function MarketingPage() {
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { subject: '', html: '' },
  });

  const htmlValue = watch('html');

  const onSubmit = async (data) => {
    try {
      const res = await adminApi.post('/admin/marketing/broadcast', data);
      setResult(res.data.data);
      setSent(true);
      toast.success('تمت إضافة الحملة للطابور بنجاح!', { description: res.data.message });
    } catch (err) {
      toast.error('فشل في إرسال الحملة', { description: err.message });
    }
  };

  /* ── Success state ──────────────────────────────────────── */
  if (sent && result) {
    return (
      <div className="max-w-xl mx-auto mt-12 animate-in fade-in zoom-in duration-500" dir="rtl">
        <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl relative">
          
          {/* Green top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />

          <div className="p-10 text-center">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">تم تجهيز الحملة للإرسال!</h2>
            <p className="text-sm font-bold text-slate-400 mb-8">يتم الآن إرسال الإيميلات في الخلفية على دفعات لتجنب الحظر.</p>

            <div className="bg-[#020617] rounded-2xl p-6 text-left space-y-4 mb-8 border border-slate-800 shadow-inner" dir="ltr">
              {[
                ['Subject', result.subject],
                ['Recipients', <span key="rec" className="text-indigo-400">{result.totalRecipients} users</span>],
                ['Queued at', new Date(result.queuedAt).toLocaleString()],
                ['Sent by', result.queuedBy],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-0.5 flex-shrink-0">{label}</span>
                  <span className="text-sm font-bold text-white text-right">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setSent(false); setResult(null); reset(); }}
              className="flex items-center justify-center gap-2 w-full py-4 text-white rounded-2xl font-black transition-all hover:-translate-y-1 active:scale-[0.98] shadow-xl shadow-indigo-500/20 bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400/20"
            >
              <Mail className="w-5 h-5" /> إرسال حملة أخرى
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Compose form ───────────────────────────────────────── */
  return (
    <div className="space-y-8 max-w-[1500px] w-full text-slate-200" dir="rtl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-2">Campaigns</p>
          <h1 className="text-3xl font-black text-black tracking-tight">Email Marketing</h1>
        </div>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex flex-col gap-8">

        {/* Compose form (Main) */}
        <div className="w-full">
          <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl relative">
            
            {/* Colored top accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              
              {/* Subject */}
              <div>
                <label className="block text-[12px] font-bold text-slate-300 uppercase tracking-widest mb-3">
                  عنوان العرض
                </label>
                <input
                  {...register('subject')}
                  placeholder="اكتب عنوان العرض هنا ....!"
                  className={`${INPUT_BASE} ${errors.subject ? INPUT_ERR : INPUT_OK}`}
                />
                {errors.subject && (
                  <p className="text-[11px] font-bold text-rose-400 mt-2 px-1">⚠ {errors.subject.message}</p>
                )}
              </div>

              {/* HTML Body */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[12px] font-bold text-slate-300 uppercase tracking-widest">
                    محتوى العروض
                  </label>
                  <span className="text-[11px] font-black text-slate-500 bg-[#020617] px-3 py-1 rounded-lg border border-slate-700 tracking-widest">
                    {htmlValue?.length || 0} / 100,000
                  </span>
                </div>
                <textarea
                  {...register('html')}
                  rows={16}
                  dir="ltr"
                  placeholder="العروض اللتي تريد ارسالها ....!"
                  className={`${INPUT_BASE} font-mono resize-y ${errors.html ? INPUT_ERR : INPUT_OK}`}
                />
                {errors.html && (
                  <p className="text-[11px] font-bold text-rose-400 mt-2 px-1">⚠ {errors.html.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-800/60 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-black transition-all disabled:opacity-70 hover:-translate-y-1 active:scale-[0.98] shadow-xl shadow-indigo-500/20 bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400/20"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending to queue ...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Send</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview (Full Width Below Form) */}
        {htmlValue && (
          <div className="w-full">
            <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]">
                <p className="text-[12px] font-black text-white uppercase tracking-widest">Live Preview</p>
              </div>
              
              {/* Preview Container - Forced Light Mode to simulate email client */}
              <div className="bg-white p-8 overflow-y-auto custom-scrollbar flex justify-center">
                <div
                  className="text-sm text-black w-full max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: htmlValue }}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}