import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Star, Clock, Eye } from 'lucide-react';
import { farmerAPI, orderAPI } from '../../api';

export default function Dashboard() {
  const { data: dashData, isLoading } = useQuery({ queryKey: ['farmerDashboard'], queryFn: () => farmerAPI.getDashboard().then(r => r.data), retry: false });

  const dash = dashData?.data || {};
  const stats = [
    { label: 'Total Revenue', value: `₹${(dash.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: '+12%', up: true },
    { label: 'Total Orders', value: dash.totalOrders || 0, icon: ShoppingBag, color: 'from-sky-500 to-sky-600', change: '+8%', up: true },
    { label: 'Active Products', value: dash.activeProducts || 0, icon: Package, color: 'from-amber-500 to-amber-600', change: '+3', up: true },
    { label: 'Avg Rating', value: dash.avgRating?.toFixed(1) || 'N/A', icon: Star, color: 'from-purple-500 to-purple-600', change: '4.8', up: true },
  ];

  const recentOrders = dash.recentOrders || [];
  const topProducts = dash.topProducts || [];

  return (
    <div id="farmer-dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Dashboard Overview</h1>
        <p className="text-neutral-500 mb-6">Welcome back! Here's your farm summary.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-neutral-900">Recent Orders</h3>
            <Link to="/farmer/orders" className="text-sm text-sky-600 font-medium hover:underline">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">No recent orders</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-sky-600" /></div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">#{order.orderNumber}</p>
                      <p className="text-xs text-neutral-500">{order.items?.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">₹{order.totalAmount}</p>
                    <span className={`text-[10px] font-semibold uppercase ${order.status === 'delivered' ? 'text-emerald-600' : 'text-sky-600'}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-neutral-900">Top Products</h3>
            <Link to="/farmer/products" className="text-sm text-sky-600 font-medium hover:underline">View All</Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">No product data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, i) => (
                <div key={product._id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                  <span className="text-sm font-bold text-neutral-300 w-6">{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0]?.url || 'https://placehold.co/80/f0f9ff/0ea5e9?text=P'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 truncate">{product.name}</p>
                    <p className="text-xs text-neutral-500">₹{product.price}/{product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-800">{product.totalSold || 0} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
