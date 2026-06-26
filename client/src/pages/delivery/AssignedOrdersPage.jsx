import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, MapPin, Clock, Navigation, ChevronRight, Truck } from 'lucide-react';
import { deliveryAPI } from '../../api';

export default function AssignedOrdersPage() {
  const [filter, setFilter] = useState('active'); // active, pending

  const { data, isLoading } = useQuery({
    queryKey: ['assignedOrders'],
    queryFn: () => deliveryAPI.getDashboard().then(r => r.data),
  });

  const activeAssignments = data?.data?.activeAssignments || [];
  // For demo, we treat placed/confirmed as pending pickup, and packed/out_for_delivery as active
  const pendingPickup = activeAssignments.filter(o => o.status === 'placed' || o.status === 'confirmed');
  const activeDelivery = activeAssignments.filter(o => o.status === 'packed' || o.status === 'out_for_delivery');

  const orders = filter === 'active' ? activeDelivery : pendingPickup;

  return (
    <div id="delivery-assigned-orders">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Assigned Orders</h1>
        <p className="text-neutral-500 text-sm">Manage your current pickups and deliveries</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'active' ? 'bg-sky-500 text-white shadow' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
          Out for Delivery ({activeDelivery.length})
        </button>
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-sky-500 text-white shadow' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
          Pending Pickup ({pendingPickup.length})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 card">
          <Truck className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">No {filter} orders</h3>
          <p className="text-neutral-500">You're all caught up for now!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 group hover:border-sky-200">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">#{order.orderNumber}</h3>
                    <p className="text-xs text-neutral-500">{order.items?.length} items • ₹{order.totalAmount}</p>
                  </div>
                </div>
                <span className="badge badge-amber uppercase text-[10px]">{order.status?.replace(/_/g, ' ')}</span>
              </div>

              <div className="space-y-4 mb-5">
                <div className="flex gap-3 relative">
                  <div className="absolute left-3 top-6 bottom-[-16px] w-0.5 bg-neutral-200" />
                  <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-400">PICKUP</p>
                    <p className="text-sm font-medium text-neutral-800">{order.pickupAddress || 'Farm Location'}</p>
                  </div>
                </div>

                <div className="flex gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-600">DELIVERY</p>
                    <p className="text-sm font-medium text-neutral-800">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{order.deliveryAddress?.fullName} • {order.deliveryAddress?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/delivery/route/${order._id}`} className="btn-primary flex-1 !py-2.5 !text-sm flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4" /> View Route
                </Link>
                <Link to={`/delivery/status/${order._id}`} className="btn-secondary !py-2.5 !text-sm flex items-center justify-center gap-2">
                  Update <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
