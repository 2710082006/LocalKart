import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Camera, ShieldCheck, MapPin } from 'lucide-react';
import { orderAPI, deliveryAPI } from '../../api';
import toast from 'react-hot-toast';

export default function DeliveryStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['orderStatus', id], queryFn: () => orderAPI.getById(id).then(r => r.data) });
  const order = data?.data;

  const updateMutation = useMutation({
    mutationFn: (status) => deliveryAPI.updateStatus(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignedOrders']);
      queryClient.invalidateQueries(['orderStatus', id]);
      toast.success('Status updated successfully!');
      if (order?.status === 'out_for_delivery') navigate('/delivery/history'); // If it was just delivered
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  if (isLoading) return <div className="p-8"><div className="h-64 skeleton rounded-2xl" /></div>;
  if (!order) return <div className="p-8 text-center text-neutral-500">Order not found</div>;

  return (
    <div id="delivery-status" className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/delivery/assigned" className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Update Status</h1>
          <p className="text-neutral-500 text-sm">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-6 border-b border-neutral-100 pb-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Customer Details</h3>
            <p className="font-semibold text-neutral-800">{order.deliveryAddress?.fullName}</p>
            <p className="text-sm text-neutral-600 mt-1">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
            <p className="text-sm text-neutral-500 mt-1">{order.deliveryAddress?.phone}</p>
          </div>
          <div className="text-right">
            <span className="badge badge-sky uppercase">{order.status?.replace(/_/g, ' ')}</span>
            <p className="font-bold text-emerald-600 mt-2 text-xl">₹{order.totalAmount}</p>
            <p className="text-xs text-neutral-400 capitalize">{order.paymentMethod?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-neutral-900 mb-2">Update Actions</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => updateMutation.mutate('out_for_delivery')}
              disabled={order.status !== 'packed'}
              className={`p-4 rounded-xl border-2 text-left transition-all ${order.status === 'packed' ? 'border-sky-500 bg-sky-50 hover:bg-sky-100' : 'border-neutral-200 bg-neutral-50 opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'packed' ? 'bg-sky-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                  1
                </div>
                <span className="font-bold text-neutral-900">Start Delivery</span>
              </div>
              <p className="text-xs text-neutral-500">I have picked up the order and am on the way.</p>
            </button>

            <button
              onClick={() => updateMutation.mutate('delivered')}
              disabled={order.status !== 'out_for_delivery'}
              className={`p-4 rounded-xl border-2 text-left transition-all ${order.status === 'out_for_delivery' ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100' : 'border-neutral-200 bg-neutral-50 opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'out_for_delivery' ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                  2
                </div>
                <span className="font-bold text-neutral-900">Mark Delivered</span>
              </div>
              <p className="text-xs text-neutral-500">I have handed over the items to the customer.</p>
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Proof of Delivery</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Delivery Notes (Optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[100px]" placeholder="Left at door, handed to security..." />
          </div>
          <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-50">
            <Camera className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-700">Add Photo Proof</p>
            <p className="text-xs text-neutral-500">Tap to take a picture of the delivered package</p>
          </div>
        </div>
      </div>
    </div>
  );
}
