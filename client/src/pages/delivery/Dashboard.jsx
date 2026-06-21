import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Truck, Package, Clock, DollarSign, MapPin, CheckCircle, ArrowUpRight, Navigation, Phone } from 'lucide-react';
import { deliveryAPI } from '../../api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['deliveryDashboard'], queryFn: () => deliveryAPI.getDashboard().then(r => r.data), retry: false });

  const dash = data?.data || {};
  const assignments = dash.activeAssignments || [];

  const updateMutation = useMutation({
    mutationFn: ({ orderId, status }) => deliveryAPI.updateStatus(orderId, { status }),
    onSuccess: () => { queryClient.invalidateQueries(['deliveryDashboard']); toast.success('Status updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: () => deliveryAPI.toggleAvailability(),
    onSuccess: () => { queryClient.invalidateQueries(['deliveryDashboard']); toast.success('Availability toggled'); },
  });

  const stats = [
    { label: 'Today\'s Deliveries', value: dash.todayDeliveries || 0, icon: Truck, color: 'from-sky-500 to-sky-600' },
    { label: 'Active Orders', value: assignments.length, icon: Package, color: 'from-amber-500 to-amber-600' },
    { label: 'Today\'s Earnings', value: `₹${dash.todayEarnings || 0}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Completed', value: dash.totalCompleted || 0, icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
  ];

  const nextStatusMap = { out_for_delivery: 'delivered' };

  return (
    <div id="delivery-dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Delivery Dashboard</h1>
          <p className="text-neutral-500 text-sm">Manage your deliveries</p>
        </div>
        <button onClick={() => toggleMutation.mutate()} className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${dash.isAvailable ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
          {dash.isAvailable ? '🟢 Online' : '⚫ Offline'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Active Assignments */}
      <div className="card p-6">
        <h3 className="font-bold text-neutral-900 mb-5">Active Assignments</h3>
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No active deliveries</p>
            <p className="text-xs text-neutral-400 mt-1">New orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-xl border border-neutral-200 hover:border-sky-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-neutral-900">#{order.orderNumber}</p>
                    <p className="text-xs text-neutral-500">{order.items?.length} items • ₹{order.totalAmount}</p>
                  </div>
                  <span className="badge badge-sky">{order.status?.replace(/_/g, ' ')}</span>
                </div>

                {/* Addresses */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">PICKUP</p>
                      <p className="text-neutral-700">{order.pickupAddress || 'Farm location'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Navigation className="w-3 h-3 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">DELIVER TO</p>
                      <p className="text-neutral-700">{order.deliveryAddress?.street || 'Customer address'}, {order.deliveryAddress?.city}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {nextStatusMap[order.status] && (
                    <button onClick={() => updateMutation.mutate({ orderId: order._id, status: nextStatusMap[order.status] })} className="btn-primary !py-2 flex-1 !text-sm">
                      <CheckCircle className="w-4 h-4" /> Mark Delivered
                    </button>
                  )}
                  <a href={`tel:${order.userId?.phone || ''}`} className="btn-secondary !py-2 !px-4">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
