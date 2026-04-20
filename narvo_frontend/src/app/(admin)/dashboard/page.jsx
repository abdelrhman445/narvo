'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp, Loader2, AlertCircle, ArrowUpRight } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import { adminApi } from '@/lib/axios';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

/* ── tiny sub-components ───────────────────────────────────────── */

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">{title}</h3>
      {action}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-slate-900/40 border border-slate-800/50 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ── main page ─────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, ordersRes, productsRes] = await Promise.all([
          adminApi.get('/admin/finance/report'),
          adminApi.get('/admin/orders?limit=5'),
          adminApi.get('/admin/products?limit=5'),
        ]);
        setReport(reportRes.data.data.summary);
        setOrders(ordersRes.data.data);
        setProducts(productsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] text-slate-200">

      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-indigo-500 mb-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-black text-[#000000] tracking-tight">Good morning 👋</h1>
        <p className="text-sm text-slate-400 mt-1.5 font-medium">Here's what's happening in your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(report?.totalIN || 0)}
          subtitle="From delivered orders"
          icon={DollarSign}
          color="indigo"
        />
        <StatsCard
          title="Total Expenses"
          value={formatPrice(report?.totalOUT || 0)}
          subtitle="Operational costs"
          icon={TrendingUp}
          color="rose"
        />
        <StatsCard
          title="Net Balance"
          value={formatPrice(report?.netBalance || 0)}
          subtitle={report?.status || '—'}
          icon={DollarSign}
          color={report?.netBalance >= 0 ? 'emerald' : 'rose'}
        />
        <StatsCard
          title="Transactions"
          value={`${report?.countIN || 0} IN / ${report?.countOUT || 0} OUT`}
          subtitle="Total ledger entries"
          icon={ShoppingCart}
          color="blue"
        />
      </div>

      {/* Two panel row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Orders */}
        <Card>
          <div className="px-6 pt-6 pb-4 bg-slate-900/20">
            <SectionHeader
              title="Recent Orders"
              action={
                <a href="/orders" className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest group">
                  View all <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              }
            />
          </div>

          <div className="divide-y divide-slate-800/40">
            {orders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <ShoppingCart className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No orders yet</p>
              </div>
            ) : (
              orders.map((order, i) => (
                <div
                  key={order._id}
                  className="group flex items-center justify-between px-6 py-5 hover:bg-slate-800/20 transition-all"
                >
                  <div className="flex items-center gap-5">
                    {/* Order number avatar */}
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/30 transition-all">
                      <span className="text-[11px] font-bold text-slate-500 font-mono group-hover:text-indigo-400">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-200 font-mono tracking-wider uppercase">
                        #{order._id.slice(-8)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black text-white">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-md border mt-1.5 inline-block uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <div className="px-6 pt-6 pb-4 bg-slate-900/20">
            <SectionHeader
              title="Inventory Alerts"
              action={
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                  <a href="/products" className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest group">
                    Manage <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              }
            />
          </div>

          <div className="divide-y divide-slate-800/40">
            {products.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Package className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No products</p>
              </div>
            ) : (
              products.map((p) => {
                const stockStatus =
                  p.stock === 0 ? { label: 'Out of stock', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' }
                  : p.stock < 10 ? { label: `${p.stock} left`, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
                  : { label: `${p.stock} in stock`, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };

                return (
                  <div
                    key={p._id}
                    className="flex items-center justify-between px-6 py-5 hover:bg-slate-800/20 transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[13px] font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">{p.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1.5 font-mono tracking-widest uppercase">{formatPrice(p.price)}</p>
                    </div>
                    <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl border flex-shrink-0 tracking-tight ${stockStatus.cls}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}