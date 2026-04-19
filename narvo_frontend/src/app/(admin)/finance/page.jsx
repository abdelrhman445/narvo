'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
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
      toast.success('Expense recorded');
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl text-foreground">Finance</h1>
        <p className="text-sm text-muted-foreground mt-1">Track revenue, expenses, and net profit</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-7 h-7 text-primary animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-700">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 font-mono">{formatPrice(summary?.totalIN || 0)}</p>
              <p className="text-xs text-emerald-600 mt-1">{summary?.countIN || 0} delivered orders</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-red-700">Total Expenses</span>
              </div>
              <p className="text-2xl font-bold text-red-700 font-mono">{formatPrice(summary?.totalOUT || 0)}</p>
              <p className="text-xs text-red-600 mt-1">{summary?.countOUT || 0} expense entries</p>
            </div>

            <div className={`border rounded-2xl p-5 ${(summary?.netBalance || 0) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(summary?.netBalance || 0) >= 0 ? 'bg-blue-100' : 'bg-amber-100'}`}>
                  <DollarSign className={`w-5 h-5 ${(summary?.netBalance || 0) >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
                </div>
                <span className={`text-xs font-mono uppercase tracking-widest ${(summary?.netBalance || 0) >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>Net Balance</span>
              </div>
              <p className={`text-2xl font-bold font-mono ${(summary?.netBalance || 0) >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                {formatPrice(summary?.netBalance || 0)}
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(summary?.netBalance || 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {summary?.status || '—'}
              </span>
            </div>
          </div>

          {/* Date Filter */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Filter by Date Range</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">From</label>
                <input type="date" value={dateRange.startDate}
                  onChange={(e) => setDateRange((d) => ({ ...d, startDate: e.target.value }))}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">To</label>
                <input type="date" value={dateRange.endDate}
                  onChange={(e) => setDateRange((d) => ({ ...d, endDate: e.target.value }))}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {(dateRange.startDate || dateRange.endDate) && (
                <button onClick={() => setDateRange({ startDate: '', endDate: '' })}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors border border-border rounded-lg">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Add Expense */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Record Expense</p>
            <form onSubmit={handleSubmit(onAddExpense)} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-muted-foreground mb-1">Amount (EGP)</label>
                <input {...register('amount')} type="number" min="0" step="0.01" placeholder="0.00"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 font-mono ${errors.amount ? 'border-destructive' : 'border-border focus:ring-primary/30'}`}
                />
                {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
              </div>
              <div className="flex-[2] min-w-[200px]">
                <label className="block text-xs text-muted-foreground mb-1">Note / Description</label>
                <input {...register('note')} placeholder="e.g. Packaging materials for January"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${errors.note ? 'border-destructive' : 'border-border focus:ring-primary/30'}`}
                />
                {errors.note && <p className="text-xs text-destructive mt-1">{errors.note.message}</p>}
              </div>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Expense
              </button>
            </form>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-display text-lg">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {['Type', 'Amount', 'Note', 'Created By', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(report?.transactions || []).length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No transactions yet</td></tr>
                  ) : (
                    (report?.transactions || []).map((t) => (
                      <tr key={t._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {t.type === 'IN' ? '↑ IN' : '↓ OUT'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-mono font-bold ${t.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === 'IN' ? '+' : '-'}{formatPrice(t.amount)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[250px] truncate">{t.note || '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.createdBy?.username || 'System'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(t.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {report?.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-muted-foreground disabled:opacity-40">← Previous</button>
                <span className="text-xs font-mono text-muted-foreground">{page} / {report.pagination.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(report.pagination.totalPages, p + 1))} disabled={page === report.pagination.totalPages} className="text-sm text-muted-foreground disabled:opacity-40">Next →</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
