'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, Eye, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/axios';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_FLOW = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setFilterStatus(''); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!filterStatus ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:border-primary/40'}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:border-primary/40'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16"><Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-foreground">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-xs">{order.userId?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.userId?.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-lg font-mono">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-muted-foreground disabled:opacity-40">← Previous</button>
            <span className="text-xs font-mono text-muted-foreground">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm text-muted-foreground disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-display text-xl">Order Details</h2>
                <p className="text-xs font-mono text-muted-foreground">#{selectedOrder._id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Customer</p>
                <div className="bg-secondary/40 rounded-xl p-3 space-y-1">
                  <p className="text-sm font-medium">{selectedOrder.userId?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.userId?.email || '—'}</p>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Shipping Details</p>
                <div className="bg-secondary/40 rounded-xl p-3 space-y-1 text-sm">
                  <p>{selectedOrder.shippingDetails?.address}</p>
                  <p className="text-muted-foreground">{selectedOrder.shippingDetails?.city} · {selectedOrder.shippingDetails?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Items Ordered</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/40 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-medium">{item.productId?.title || `Product #${i + 1}`}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.priceAtPurchase)}</p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(item.quantity * item.priceAtPurchase)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-base pt-3 border-t border-border mt-3">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Update Status</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1.5 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                    Current: {selectedOrder.status}
                  </span>
                </div>
                {STATUS_FLOW[selectedOrder.status]?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {STATUS_FLOW[selectedOrder.status].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(selectedOrder._id, s)}
                        disabled={updating}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-70 ${
                          s === 'Cancelled'
                            ? 'border-red-200 text-red-700 hover:bg-red-50'
                            : 'border-primary/30 text-primary hover:bg-primary/10'
                        }`}
                      >
                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        → {s}
                      </button>
                    ))}
                  </div>
                )}
                {STATUS_FLOW[selectedOrder.status]?.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">This order is in a final state and cannot be updated.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
