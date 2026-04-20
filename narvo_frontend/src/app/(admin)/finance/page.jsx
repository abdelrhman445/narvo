'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Plus, ArrowUpRight, ArrowDownRight, CalendarDays, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';

const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  note: z.string().min(3, 'Note required').max(500),
});

// إعدادات ألوان الحقول لتتناسب مع الـ Dark Mode
const INPUT = 'w-full px-5 py-4 rounded-2xl text-sm font-bold border bg-[#020617] text-white placeholder-slate-500 outline-none transition-all focus:ring-2 shadow-inner';
const INPUT_OK = 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-600';
const INPUT_ERR = 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20';

export default function FinancePage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [page, setPage] = useState(1);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      const { data } = await adminApi.get('/admin/finance/report', { params });
      setReport(data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [page, dateRange]);

  const onAddExpense = async (data) => {
    setSaving(true);
    try {
      await adminApi.post('/admin/finance/expense', data);
      toast.success('Expense recorded successfully');
      reset();
      fetchReport();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const summary = report?.summary;

  return (
    <div className="space-y-8 max-w-[1500px] w-full text-slate-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-2">Ledger</p>
          <h1 className="text-3xl font-black text-black tracking-tight">Finance</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Loading Financial Data...</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Revenue */}
            <div className="bg-[#0f172a] border border-emerald-500/30 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl group hover:border-emerald-500/50 transition-all">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-emerald-500/50" />
                </div>
                <h4 className="text-3xl lg:text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">
                  {formatPrice(summary?.totalIN || 0)}
                </h4>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Total Revenue</p>
                <p className="text-[11px] font-bold text-slate-500 mt-2 tracking-wide">
                  <span className="text-emerald-400">{summary?.countIN || 0}</span> delivered orders
                </p>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-[#0f172a] border border-rose-500/30 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl group hover:border-rose-500/50 transition-all">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <TrendingDown className="w-6 h-6 text-rose-400" />
                  </div>
                  <ArrowDownRight className="w-6 h-6 text-rose-500/50" />
                </div>
                <h4 className="text-3xl lg:text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">
                  {formatPrice(summary?.totalOUT || 0)}
                </h4>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Total Expenses</p>
                <p className="text-[11px] font-bold text-slate-500 mt-2 tracking-wide">
                  <span className="text-rose-400">{summary?.countOUT || 0}</span> expense entries
                </p>
              </div>
            </div>

            {/* Net Balance */}
            <div className={`bg-[#0f172a] border rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl group transition-all ${
              (summary?.netBalance || 0) >= 0 ? 'border-indigo-500/30 hover:border-indigo-500/50' : 'border-amber-500/30 hover:border-amber-500/50'
            }`}>
              <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                (summary?.netBalance || 0) >= 0 ? 'bg-indigo-500/10 group-hover:bg-indigo-500/20' : 'bg-amber-500/10 group-hover:bg-amber-500/20'
              }`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border group-hover:scale-110 transition-transform duration-500 ${
                    (summary?.netBalance || 0) >= 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-amber-500/10 border-amber-500/20'
                  }`}>
                    <DollarSign className={`w-6 h-6 ${
                      (summary?.netBalance || 0) >= 0 ? 'text-indigo-400' : 'text-amber-400'
                    }`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                    (summary?.netBalance || 0) >= 0 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {summary?.status || '—'}
                  </span>
                </div>
                <h4 className="text-3xl lg:text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">
                  {formatPrice(summary?.netBalance || 0)}
                </h4>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Net Balance</p>
                <p className="text-[11px] font-bold text-slate-500 mt-2 tracking-wide">
                  Revenue minus expenses
                </p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Date Filter & Add Expense */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Date Filter */}
              <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <CalendarDays className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Filter by Period</h3>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'From Date', key: 'startDate' },
                    { label: 'To Date', key: 'endDate' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                      <input
                        type="date"
                        value={dateRange[key]}
                        onChange={(e) => setDateRange((d) => ({ ...d, [key]: e.target.value }))}
                        style={{ colorScheme: 'dark' }}
                        className="w-full px-5 py-4 bg-[#020617] border border-slate-700 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-mono shadow-inner hover:border-slate-600"
                      />
                    </div>
                  ))}
                  
                  {(dateRange.startDate || dateRange.endDate) && (
                    <button
                      onClick={() => setDateRange({ startDate: '', endDate: '' })}
                      className="w-full py-4 text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 border border-slate-700 bg-[#020617] rounded-2xl transition-all hover:border-rose-500/30 hover:bg-rose-500/10 shadow-sm"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Add Expense */}
              <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Wallet className="w-5 h-5 text-rose-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Record Expense</h3>
                </div>
                <form onSubmit={handleSubmit(onAddExpense)} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount (EGP)</label>
                    <input
                      {...register('amount')}
                      type="number" min="0" step="0.01" placeholder="0.00"
                      className={`${INPUT} font-mono text-lg ${errors.amount ? INPUT_ERR : INPUT_OK}`}
                    />
                    {errors.amount && <p className="text-[11px] font-bold text-rose-400 mt-2 px-1">{errors.amount.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description Note</label>
                    <textarea
                      {...register('note')}
                      rows={3}
                      placeholder="e.g. Packaging materials for January..."
                      className={`${INPUT} resize-none ${errors.note ? INPUT_ERR : INPUT_OK}`}
                    />
                    {errors.note && <p className="text-[11px] font-bold text-rose-400 mt-2 px-1">{errors.note.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-70 shadow-xl shadow-indigo-500/20 active:scale-[0.98] bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400/20 hover:shadow-indigo-500/40"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Add Expense
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Transactions Table */}
            <div className="lg:col-span-8">
              <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl h-full flex flex-col">
                
                <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]">
                  <h3 className="text-base font-black text-white uppercase tracking-widest">Transaction History</h3>
                  <div className="flex items-center gap-2 bg-[#020617] px-4 py-2 rounded-xl border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Records</span>
                    <span className="text-xs font-black text-indigo-400">{report?.pagination?.total || 0}</span>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar flex-1 bg-[#0f172a]">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="bg-[#1e293b]/50 border-b border-slate-700/50">
                        {['Type', 'Amount', 'Note', 'By', 'Date'].map((h) => (
                          <th key={h} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(report?.transactions || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-32">
                            <div className="w-16 h-16 bg-[#020617] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                              <Wallet className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No transactions recorded yet.</p>
                          </td>
                        </tr>
                      ) : (
                        (report?.transactions || []).map((t) => (
                          <tr key={t._id} className="group hover:bg-slate-800/50 transition-colors">
                            <td className="px-8 py-5">
                              <span className={`inline-flex items-center gap-2 text-[10px] font-black px-3.5 py-1.5 rounded-xl border tracking-widest uppercase ${
                                t.type === 'IN'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {t.type === 'IN' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {t.type}
                              </span>
                            </td>
                            <td className={`px-8 py-5 font-mono font-black text-base ${t.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {t.type === 'IN' ? '+' : '-'}{formatPrice(t.amount)}
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-sm font-bold text-slate-300 max-w-[250px] truncate group-hover:text-white transition-colors">{t.note || '—'}</p>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[12px] font-bold text-slate-400 bg-[#020617] px-3 py-1.5 rounded-lg border border-slate-700">
                                {t.createdBy?.username || 'System'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-[12px] font-bold text-slate-400 whitespace-nowrap">
                              {formatDate(t.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {report?.pagination?.totalPages > 1 && (
                  <div className="flex items-center justify-between px-8 py-6 border-t border-slate-800 bg-[#0f172a] mt-auto">
                    <button 
                      onClick={() => setPage((p) => Math.max(1, p - 1))} 
                      disabled={page === 1}
                      className="text-[12px] font-black tracking-widest uppercase text-slate-300 disabled:opacity-30 hover:text-indigo-400 transition-colors px-5 py-2.5 rounded-xl hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/20 disabled:border-transparent disabled:hover:bg-transparent"
                    >
                      ← Previous
                    </button>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Page</span>
                      <span className="text-sm font-black text-white bg-[#020617] px-4 py-1.5 rounded-lg border border-slate-700 shadow-inner">{page}</span>
                      <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">of {report.pagination.totalPages}</span>
                    </div>
                    <button 
                      onClick={() => setPage((p) => Math.min(report.pagination.totalPages, p + 1))} 
                      disabled={page === report.pagination.totalPages}
                      className="text-[12px] font-black tracking-widest uppercase text-slate-300 disabled:opacity-30 hover:text-indigo-400 transition-colors px-5 py-2.5 rounded-xl hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/20 disabled:border-transparent disabled:hover:bg-transparent"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}