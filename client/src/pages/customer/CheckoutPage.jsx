import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Plus, Check, ArrowRight, Shield, Clock } from 'lucide-react';
import { addressAPI, orderAPI, paymentAPI } from '../../api';
import { resetCart } from '../../features/cartSlice';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);
  const { items, subtotal, deliveryFee, total } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: addressData } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressAPI.getAll().then(r => r.data),
    onSuccess: (data) => {
      const def = data.data?.find(a => a.isDefault);
      if (def) setSelectedAddress(def._id);
    }
  });

  const addresses = addressData?.data || [];

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setProcessing(true);
    try {
      const orderData = {
        farmerId: items[0].product.farmerId._id || items[0].product.farmerId,
        deliveryAddress: selectedAddress,
        paymentMethod: paymentMethod === "online" ? "razorpay" : "cod",
        items: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity
        }))
      };
      if (paymentMethod === 'online') {
        // Step 1: Create actual order in DB first
        const { data: order } = await orderAPI.create(orderData);

        // Step 2: Create Razorpay order from backend
        const { data: paymentOrder } = await paymentAPI.createOrder({
          orderId: order.data._id
        });

        const options = {
          key: paymentOrder.data.key,
          amount: paymentOrder.data.amount,
          currency: paymentOrder.data.currency,
          order_id: paymentOrder.data.orderId,

          name: "Farm2Door",
          description: "Farm Fresh Order",

          handler: async function (response) {
            await paymentAPI.verify(response);

            toast.success("Payment successful!");
            dispatch(resetCart());
            navigate(`/orders/${order.data._id}`);
          },

          theme: {
            color: "#0EA5E9"
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        const { data: order } = await orderAPI.create(orderData);
        dispatch(resetCart());
        toast.success('Order placed successfully!');
        navigate(`/orders/${order.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setProcessing(false); }
  };

  return (
    <div className="pt-20 pb-12" id="checkout-page">
      <div className="container">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Address */}
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-sky-500" /> Delivery Address</h2>
              {addresses.length === 0 ? (
                <div className="card-flat p-8 text-center">
                  <p className="text-neutral-500 mb-4">No saved addresses</p>
                  <button className="btn-primary inline-flex"><Plus className="w-5 h-5" /> Add Address</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {addresses.map((a) => (
                    <button key={a._id} onClick={() => setSelectedAddress(a._id)} className={`card-flat p-4 text-left transition-all ${selectedAddress === a._id ? 'ring-2 ring-sky-500 bg-sky-50' : 'hover:bg-neutral-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="badge badge-sky text-xs">{a.type || 'Home'}</span>
                        {selectedAddress === a._id && <Check className="w-5 h-5 text-sky-500" />}
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">{a.fullName}</p>
                      <p className="text-xs text-neutral-500 mt-1">{a.street}, {a.city}, {a.state} - {a.pincode}</p>
                      <p className="text-xs text-neutral-400 mt-1">{a.phone}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment */}
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-sky-500" /> Payment Method</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { value: 'online', label: 'Pay Online', desc: 'UPI, Card, Net Banking', icon: '💳' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered', icon: '💵' },
                ].map((m) => (
                  <button key={m.value} onClick={() => setPaymentMethod(m.value)} className={`card-flat p-4 flex items-center gap-4 text-left transition-all ${paymentMethod === m.value ? 'ring-2 ring-sky-500 bg-sky-50' : 'hover:bg-neutral-50'}`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-neutral-800">{m.label}</p>
                      <p className="text-xs text-neutral-500">{m.desc}</p>
                    </div>
                    {paymentMethod === m.value && <Check className="w-5 h-5 text-sky-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Items ({items.length})</h2>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="card-flat p-3 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                      <img src={item.product?.images?.[0]?.url || 'https://placehold.co/200/f0f9ff/0ea5e9?text=Item'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-800 truncate">{item.product?.name}</p>
                      <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-neutral-800">₹{(item.product?.price || 0) * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-neutral-900 mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal ({items.length} items)</span><span className="font-semibold">₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span className="font-semibold text-emerald-600">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between text-base"><span className="font-bold">Total</span><span className="font-bold text-sky-600">₹{total}</span></div>
              </div>
              <button onClick={handlePlaceOrder} disabled={processing} className="btn-primary w-full !py-3.5 mb-4" id="place-order">
                {processing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Place Order <ArrowRight className="w-5 h-5" /></>}
              </button>
              <div className="flex items-center gap-2 text-xs text-neutral-400 justify-center">
                <Shield className="w-4 h-4" /> Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
