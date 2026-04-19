'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import { adminApi } from '@/lib/axios';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(report?.totalIN || 0)}
          subtitle="From delivered orders"
          icon={DollarSign}
          color="emerald"
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

      {/* Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-display text-lg text-foreground">Recent Orders</h3>
          </div>
          <div className="divide-y divide-border">
            {orders.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">No orders yet</div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div>
                    <p className="text-sm font-mono text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground">Inventory Alerts</h3>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="divide-y divide-border">
            {products.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">No products</div>
            ) : (
              products.map((p) => (
                <div key={p._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatPrice(p.price)}</p>
                  </div>
                  <div className="text-right ml-3">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : p.stock < 10
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
