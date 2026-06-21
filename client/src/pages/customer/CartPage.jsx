import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../../features/cartSlice';
import { useEffect } from 'react';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, count, subtotal, deliveryFee, total, loading } = useSelector((s) => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  if (!loading && items.length === 0) {
    return (
      <div className="pt-20 pb-12 container text-center" id="cart-page">
        <div className="max-w-md mx-auto py-20">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Your cart is empty</h2>
          <p className="text-neutral-500 mb-6">Add some fresh produce to get started</p>
          <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12" id="cart-page">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Shopping Cart</h1>
            <p className="text-neutral-500 mt-1">{count} items in your cart</p>
          </div>
          <button onClick={() => dispatch(clearCart())} className="btn-ghost text-red-500 hover:!bg-red-50">
            <Trash2 className="w-4 h-4" /> Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div key={item.product?._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="card-flat p-4 flex gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  <img src={item.product?.images?.[0]?.url || 'https://placehold.co/200/f0f9ff/0ea5e9?text=Item'} alt={item.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?._id}`} className="font-semibold text-neutral-800 hover:text-sky-600 truncate block">{item.product?.name}</Link>
                  <p className="text-xs text-neutral-500 mb-2">{item.product?.farmerId?.farmName || 'Local Farm'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-neutral-200 rounded-lg">
                      <button onClick={() => dispatch(updateCartItem({ productId: item.product?._id, quantity: Math.max(1, item.quantity - 1) }))} className="p-1.5 hover:bg-neutral-50"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ productId: item.product?._id, quantity: item.quantity + 1 }))} className="p-1.5 hover:bg-neutral-50"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sky-600">₹{(item.product?.price || 0) * item.quantity}</span>
                      <button onClick={() => dispatch(removeFromCart(item.product?._id))} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-neutral-900 mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-semibold">₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Delivery Fee</span><span className="font-semibold">{deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${deliveryFee}`}</span></div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between text-base"><span className="font-bold">Total</span><span className="font-bold text-sky-600">₹{total}</span></div>
              </div>
              <Link to="/checkout" className="btn-primary w-full !py-3.5" id="proceed-checkout">
                Checkout <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products" className="btn-ghost w-full mt-3 justify-center text-sky-600">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
