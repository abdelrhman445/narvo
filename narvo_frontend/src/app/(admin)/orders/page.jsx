'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, Eye, ChevronRight, ShoppingCart, X, Package, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_FLOW = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

// تم تحديث الألوان لتتناسب مع الـ Dark Mode وتكون واضحة جداً
const STATUS_COLORS = {
  Pending:   { dot: '#fbbf24', bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
  Confirmed: { dot: '#818cf8', bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20' },
  Shipped:   { dot: '#a78bfa', bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20' },
  Delivered: { dot: '#34d399', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Cancelled: { dot: '#fb7185', bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20' },
};

function StatusBadge({ status, size = 'sm' }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span className={`inline-flex items-center gap-2 font-black border rounded-xl uppercase tracking-widest ${c.bg} ${c.text} ${c.border} ${size === 'sm' ? 'text-[10px] px-3 py-1.5' : 'text-xs px-4 py-2'}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterStatus) params.status = filterStatus;
      const { data } = await adminApi.get('/admin/orders', { params });
      setOrders(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await adminApi.put(`/admin/orders/${orderId}`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((o) => ({ ...o, status: newStatus }));
      }
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) =>
    search
      ? o._id.toLowerCase().includes(search.toLowerCase()) ||
        o.userId?.email?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-8 max-w-[1500px] w-full text-slate-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-2">Management</p>
          <h1 className="text-3xl font-black text-[#000000] tracking-tight">Orders</h1>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 p-6 flex flex-col lg:flex-row lg:items-center gap-6 shadow-2xl">
        {/* Search */}
        <div className="relative flex-1 w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID or Customer Email..."
            className="w-full pl-14 pr-5 py-4 bg-[#020617] border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-inner"
          />
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setFilterStatus(''); setPage(1); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              !filterStatus
                ? 'text-white border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 bg-[#020617] border-slate-700 hover:border-slate-500 hover:text-slate-200'
            }`}
            style={!filterStatus ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
          >
            All Orders
          </button>
          {STATUSES.map((s) => {
            const c = STATUS_COLORS[s];
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                  active
                    ? `${c.bg} ${c.text} ${c.border} shadow-lg`
                    : 'text-slate-400 bg-[#020617] border-slate-700 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar bg-[#0f172a]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1e293b] border-b border-slate-700/50">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[12px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-24">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Loading Orders...</p>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-24">
                  <div className="w-16 h-16 bg-[#020617] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <ShoppingCart className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-base font-bold text-slate-300">No orders found</p>
                </td></tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order._id}
                    className="group hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <span className="font-mono text-[13px] font-bold text-slate-300 bg-[#020617] border border-slate-700 px-3 py-1.5 rounded-lg uppercase tracking-wider group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                        #{order._id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-white">{order.userId?.name || 'Guest User'}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">{order.userId?.email || '—'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[11px] bg-[#020617] border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-black tracking-widest uppercase">
                        {order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-white">{formatPrice(order.totalAmount)}</td>
                    <td className="px-8 py-5"><StatusBadge status={order.status} /></td>
                    <td className="px-8 py-5 text-[12px] text-slate-400 font-bold whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-[12px] font-bold text-slate-300 rounded-xl hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
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
              ← Previous
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Page</span>
              <span className="text-sm font-black text-white bg-[#020617] px-4 py-1.5 rounded-lg border border-slate-700 shadow-inner">{page}</span>
              <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">of {totalPages}</span>
            </div>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="text-[12px] font-black tracking-widest uppercase text-slate-300 disabled:opacity-30 hover:text-indigo-400 transition-colors px-5 py-2.5 rounded-xl hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/20 disabled:border-transparent disabled:hover:bg-transparent"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md transition-opacity" onClick={() => setSelectedOrder(null)} />
          <div
            className="relative bg-[#0f172a] w-full sm:max-w-2xl rounded-[2rem] max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl shadow-black animate-in fade-in zoom-in-95 duration-300"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b] rounded-t-[2rem]">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Order Details</h2>
                <p className="text-xs font-mono font-bold text-slate-400 mt-1.5 uppercase tracking-widest">#{selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#020617] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

              {/* Status Header */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-[#020617] p-5 rounded-2xl border border-slate-800 shadow-inner">
                <StatusBadge status={selectedOrder.status} size="md" />
                <span className="text-2xl font-black text-white">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer */}
                <section>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> Customer Info
                  </p>
                  <div className="bg-[#020617] rounded-2xl p-5 border border-slate-800 h-full">
                    <p className="text-sm font-bold text-white">{selectedOrder.userId?.name || 'Guest User'}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1.5">{selectedOrder.userId?.email || 'No email provided'}</p>
                  </div>
                </section>

                {/* Shipping */}
                <section>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Shipping Details
                  </p>
                  <div className="bg-[#020617] rounded-2xl p-5 border border-slate-800 h-full space-y-1.5">
                    <p className="text-sm font-bold text-white leading-relaxed">{selectedOrder.shippingDetails?.address}</p>
                    <p className="text-xs font-medium text-slate-400">
                      {selectedOrder.shippingDetails?.city} · {selectedOrder.shippingDetails?.phone}
                    </p>
                  </div>
                </section>
              </div>

              {/* Items */}
              <section>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" /> Order Items
                </p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#020617] rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-slate-200 truncate">
                          {item.productId?.title || `Product #${i + 1}`}
                        </p>
                        <p className="text-[11px] font-bold text-slate-500 mt-1.5 font-mono uppercase tracking-widest">
                          QTY: {item.quantity} <span className="mx-2 text-slate-700">|</span> {formatPrice(item.priceAtPurchase)}
                        </p>
                      </div>
                      <p className="text-base font-black text-white flex-shrink-0">
                        {formatPrice(item.quantity * item.priceAtPurchase)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Status Update Actions */}
              {STATUS_FLOW[selectedOrder.status]?.length > 0 && (
                <section className="pt-4 border-t border-slate-800/60">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Update Order Status</p>
                  <div className="flex gap-3 flex-wrap">
                    {STATUS_FLOW[selectedOrder.status].map((s) => {
                      const c = STATUS_COLORS[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(selectedOrder._id, s)}
                          disabled={updating}
                          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest border transition-all disabled:opacity-50 hover:scale-[0.98] active:scale-95 ${c.bg} ${c.text} ${c.border} hover:opacity-80 shadow-md`}
                        >
                          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                          Move to {s}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
              
              {STATUS_FLOW[selectedOrder.status]?.length === 0 && (
                <div className="pt-4 border-t border-slate-800/60">
                  <div className="bg-[#020617] border border-slate-800 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">This order is in a final state.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}