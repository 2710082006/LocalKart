import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, MapPin, Package, Star, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { orderAPI, productAPI, farmerAPI } from '../../api';

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);

  const { data: ordersData } = useQuery({ queryKey: ['myOrders'], queryFn: () => orderAPI.getAll({ limit: 5 }).then(r => r.data), retry: false });
  const { data: featuredData } = useQuery({ queryKey: ['featuredProducts'], queryFn: () => productAPI.getFeatured().then(r => r.data) });
  const { data: farmersData } = useQuery({ queryKey: ['featuredFarmers'], queryFn: () => farmerAPI.getFeatured().then(r => r.data) });

  const orders = ordersData?.data || [];
  const products = featuredData?.data || [];
  const farmers = farmersData?.data || [];
  const statusColors = { placed: 'badge-sky', confirmed: 'badge-green', packed: 'badge-amber', out_for_delivery: 'badge-sky', delivered: 'badge-green', cancelled: 'badge-red' };

  return (
    <div className="pt-20 pb-12" id="customer-dashboard">
      <div className="container">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p className="text-neutral-500 mt-1">Here's what's fresh for you today</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: ShoppingBag, label: 'Shop', path: '/products', color: 'from-sky-500 to-sky-600' },
            { icon: MapPin, label: 'Nearby', path: '/farmers', color: 'from-emerald-500 to-emerald-600' },
            { icon: Package, label: 'Orders', path: '/orders', color: 'from-amber-500 to-amber-600' },
            { icon: Heart, label: 'Wishlist', path: '/wishlist', color: 'from-rose-500 to-rose-600' },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={a.path} className="card p-5 flex items-center gap-4 hover:border-sky-200 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-neutral-800">{a.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Active Orders */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-neutral-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {orders.length === 0 ? (
            <div className="card-flat p-12 text-center">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">No orders yet</p>
              <Link to="/products" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order, i) => (
                <Link key={order._id} to={`/orders/${order._id}`} className="card-flat p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center"><Package className="w-5 h-5 text-sky-600" /></div>
                    <div>
                      <p className="font-semibold text-sm text-neutral-800">#{order.orderNumber}</p>
                      <p className="text-xs text-neutral-500">{order.items?.length} items • ₹{order.totalAmount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${statusColors[order.status] || 'badge-sky'}`}>{order.status?.replace(/_/g, ' ')}</span>
                    <p className="text-xs text-neutral-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Products */}
        {products.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-neutral-900">Recommended for You</h2>
              <Link to="/products" className="text-sm text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).map((p) => (
                <Link key={p._id} to={`/products/${p._id}`} className="card group">
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    <img src={p.images?.[0]?.url || 'https://placehold.co/400x400/f0f9ff/0ea5e9?text=Product'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-neutral-800 truncate">{p.name}</p>
                    <p className="text-xs text-neutral-500 mb-2">{p.farmerId?.farmName}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-600">₹{p.price}<span className="text-xs text-neutral-400 font-normal">/{p.unit}</span></span>
                      {p.rating?.average > 0 && <span className="flex items-center gap-1 text-xs text-amber-600"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{p.rating.average}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Farmers */}
        {farmers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-neutral-900">Featured Farmers</h2>
              <Link to="/farmers" className="text-sm text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {farmers.slice(0, 4).map((f) => (
                <Link key={f._id} to={`/farmers/${f._id}`} className="card p-4 flex items-center gap-4 hover:border-sky-200">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {f.userId?.name?.charAt(0) || 'F'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-800 truncate">{f.farmName}</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.location?.city || 'Local'}</p>
                    {f.rating?.average > 0 && <p className="text-xs text-amber-600 flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {f.rating.average}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
