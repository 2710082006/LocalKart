import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, MapPin, Navigation, Truck, CheckCircle } from 'lucide-react';
import { deliveryAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AvailableOrdersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['availableOrders'],
    queryFn: () => deliveryAPI.getAvailableOrders().then(r => r.data),
    retry: false
  });

  const acceptMutation = useMutation({
    mutationFn: (orderId) => deliveryAPI.acceptOrder(orderId),
    onSuccess: () => {
      toast.success('Order accepted successfully!');
      queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
      queryClient.invalidateQueries({ queryKey: ['assignedOrders'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept order');
    }
  });

  const orders = data?.data || [];

  if (isError) {
    return (
      <div className="text-center py-20 card">
        <MapPin className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-neutral-800 mb-2">Location Required</h3>
        <p className="text-neutral-500">{error.response?.data?.message || 'Please update your address profile to view nearby orders.'}</p>
      </div>
    );
  }

  return (
    <div id="delivery-available-orders">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Available Orders</h1>
        <p className="text-neutral-500 text-sm">Nearby unassigned orders within 10 km</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 card">
          <Truck className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">No available orders</h3>
          <p className="text-neutral-500">There are no nearby orders waiting for delivery right now.</p>
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
                <span className="badge badge-sky uppercase text-[10px]">{order.status?.replace(/_/g, ' ')}</span>
              </div>

              <div className="space-y-4 mb-5">
                <div className="flex gap-3 relative">
                  <div className="absolute left-3 top-6 bottom-[-16px] w-0.5 bg-neutral-200" />
                  <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-400">PICKUP (Farm)</p>
                    <p className="text-sm font-medium text-neutral-800">{order.farmerId?.farmName}</p>
                    <p className="text-xs text-neutral-500">{order.farmerId?.location?.city || 'Local Farm'}</p>
                  </div>
                </div>

                <div className="flex gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-600">DELIVERY (Customer)</p>
                    <p className="text-sm font-medium text-neutral-800">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => acceptMutation.mutate(order._id)}
                disabled={acceptMutation.isPending}
                className="w-full btn-primary !py-2.5 !text-sm flex items-center justify-center gap-2"
              >
                {acceptMutation.isPending && acceptMutation.variables === order._id ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Accept Order
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
