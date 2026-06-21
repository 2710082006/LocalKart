import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, XCircle, Clock, Truck, Eye, ChevronDown } from 'lucide-react';
import { orderAPI } from '../../api';
import toast from 'react-hot-toast';

const statusColors = { placed: 'badge-sky', confirmed: 'badge-green', packed: 'badge-amber', out_for_delivery: 'badge-sky', delivered: 'badge-green', cancelled: 'badge-red' };

export default function OrdersPage() {
  const [filter, setFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['farmerOrders', filter],
    queryFn: () => orderAPI.getAll({ status: filter || undefined }).then(r => r.data),
  });

  const orders = data?.data || [];

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, { status });
      toast.success(`Order ${status}`);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const tabs = ['', 'placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div id="farmer-orders">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Orders</h1>
      <p className="text-neutral-500 text-sm mb-6">Manage incoming orders</p>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {tabs.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === t ? 'bg-sky-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            {t ? t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">#{order.orderNumber}</p>
                    <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{order.items?.length} items • {order.userId?.name || 'Customer'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900">₹{order.totalAmount}</p>
                    <span className={`badge ${statusColors[order.status] || 'badge-sky'}`}>{order.status?.replace(/_/g, ' ')}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {order.status === 'placed' && (
                      <>
                        <button onClick={() => handleUpdateStatus(order._id, 'confirmed')} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Confirm">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleUpdateStatus(order._id, 'cancelled')} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Reject">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => handleUpdateStatus(order._id, 'packed')} className="btn-primary !py-2 !px-3 !text-xs">Mark Packed</button>
                    )}
                    {order.status === 'packed' && (
                      <button onClick={() => handleUpdateStatus(order._id, 'out_for_delivery')} className="btn-primary !py-2 !px-3 !text-xs">Send for Delivery</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Items preview */}
              <div className="mt-4 flex flex-wrap gap-2">
                {order.items?.slice(0, 4).map((item, j) => (
                  <div key={j} className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-neutral-700 font-medium">{item.name || item.product?.name}</span>
                    <span className="text-xs text-neutral-400">×{item.quantity}</span>
                  </div>
                ))}
                {order.items?.length > 4 && <span className="text-xs text-neutral-400 self-center">+{order.items.length - 4} more</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
