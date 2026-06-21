import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowRight } from 'lucide-react';
import { orderAPI } from '../../api';

const statusConfig = {
  placed: { color: 'badge-sky', icon: Package, label: 'Placed' },
  confirmed: { color: 'badge-sky', icon: CheckCircle, label: 'Confirmed' },
  packed: { color: 'badge-amber', icon: Package, label: 'Packed' },
  out_for_delivery: { color: 'badge-sky', icon: Truck, label: 'Out for Delivery' },
  delivered: { color: 'badge-green', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'badge-red', icon: XCircle, label: 'Cancelled' },
};

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status],
    queryFn: () => orderAPI.getAll({ status: status || undefined }).then(r => r.data),
  });

  const orders = data?.data || [];
  const tabs = ['all', 'placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="pt-20 pb-12" id="orders-page">
      <div className="container">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">My Orders</h1>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map((t) => (
            <button key={t} onClick={() => { const p = new URLSearchParams(); if (t !== 'all') p.set('status', t); setSearchParams(p); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                (t === 'all' && !status) || status === t ? 'bg-sky-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card-flat p-6"><div className="h-6 skeleton w-1/3 mb-3" /><div className="h-4 skeleton w-1/2" /></div>)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No orders found</h3>
            <Link to="/products" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const sc = statusConfig[order.status] || statusConfig.placed;
              const StatusIcon = sc.icon;
              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/orders/${order._id}`} className="card-flat p-5 block hover:bg-neutral-50 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center"><StatusIcon className="w-5 h-5 text-sky-600" /></div>
                        <div>
                          <p className="font-bold text-neutral-900">#{order.orderNumber}</p>
                          <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${sc.color}`}>{sc.label}</span>
                        <p className="text-lg font-bold text-neutral-900 mt-1">₹{order.totalAmount}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-neutral-500">{order.items?.length} items</p>
                      <span className="text-sky-600 font-medium group-hover:underline flex items-center gap-1">View Details <ArrowRight className="w-4 h-4" /></span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
