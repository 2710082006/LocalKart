import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Truck, MapPin, Clock, Phone, ArrowLeft, XCircle } from 'lucide-react';
import { orderAPI } from '../../api';
import toast from 'react-hot-toast';

const timelineSteps = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => orderAPI.getById(id).then(r => r.data) });
  const order = data?.data;

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    try {
      await orderAPI.cancel(id, { reason: 'Customer cancelled' });
      toast.success('Order cancelled');
      window.location.reload();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (isLoading) return <div className="pt-20 pb-12 container"><div className="h-10 skeleton w-1/3 mb-6" /><div className="h-64 skeleton rounded-2xl" /></div>;
  if (!order) return <div className="pt-20 pb-12 container text-center"><p className="text-xl text-neutral-500">Order not found</p></div>;

  const currentStep = timelineSteps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="pt-20 pb-12" id="order-detail-page">
      <div className="container max-w-4xl">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-sky-600 mb-6"><ArrowLeft className="w-4 h-4" /> Back to Orders</Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          {!isCancelled && currentStep < 3 && (
            <button onClick={handleCancel} className="btn-ghost text-red-500 hover:!bg-red-50">Cancel Order</button>
          )}
        </div>

        {/* Order Timeline */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-neutral-900 mb-6">Order Status</h3>
          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">Order Cancelled</p>
                <p className="text-sm text-red-500">{order.cancellationReason || 'This order has been cancelled'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-[5%] right-[5%] h-1 bg-neutral-100 rounded-full">
                <motion.div className="h-full bg-sky-500 rounded-full" initial={{ width: '0%' }} animate={{ width: `${(currentStep / (timelineSteps.length - 1)) * 100}%` }} transition={{ duration: 1 }} />
              </div>
              {timelineSteps.map((step, i) => {
                const isComplete = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step} className="relative z-10 text-center flex-1">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-all ${isComplete ? 'bg-sky-500 text-white' : 'bg-neutral-100 text-neutral-400'} ${isCurrent ? 'ring-4 ring-sky-100' : ''}`}>
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${isComplete ? 'text-sky-600' : 'text-neutral-400'}`}>{step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="card p-6">
            <h3 className="font-bold text-neutral-900 mb-4">Items ({order.items?.length})</h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden">
                    <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100/f0f9ff/0ea5e9?text=Item'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-800">{item.product?.name || item.name}</p>
                    <p className="text-xs text-neutral-500">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <span className="font-semibold text-neutral-800">₹{item.quantity * item.price}</span>
                </div>
              ))}
              <div className="border-t border-neutral-100 pt-3 mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span className="text-sky-600">₹{order.totalAmount}</span></div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-sky-500" /> Delivery Address</h3>
              <p className="text-sm text-neutral-600">{order.deliveryAddress?.fullName}</p>
              <p className="text-sm text-neutral-500">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
              <p className="text-sm text-neutral-500">{order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}</p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-sky-500" /> Payment</h3>
              <p className="text-sm text-neutral-600 capitalize">{order.paymentMethod?.replace(/_/g, ' ')}</p>
              <p className={`text-sm font-medium mt-1 ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus}</p>
            </div>
            {order.deliveryAgentId && (
              <div className="card p-6">
                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-sky-500" /> Delivery Agent</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
                    {order.deliveryAgentId.userId?.avatar?.url ? (
                      <img src={order.deliveryAgentId.userId.avatar.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Truck className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{order.deliveryAgentId.userId?.name || 'Assigned Agent'}</p>
                    <p className="text-xs text-neutral-500">{order.deliveryAgentId.userId?.phone || 'Phone pending'} • {order.deliveryAgentId.vehicleNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
