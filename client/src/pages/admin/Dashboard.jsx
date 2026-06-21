import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, Leaf, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { adminAPI } from '../../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['adminDashboard'], queryFn: () => adminAPI.getDashboard().then(r => r.data), retry: false });

  const dash = data?.data || {};
  const stats = [
    { label: 'Total Revenue', value: `₹${(dash.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: '+15.3%' },
    { label: 'Total Users', value: (dash.totalUsers || 0).toLocaleString(), icon: Users, color: 'from-sky-500 to-sky-600', change: '+8.2%' },
    { label: 'Total Orders', value: (dash.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'from-amber-500 to-amber-600', change: '+12.5%' },
    { label: 'Active Farmers', value: dash.activeFarmers || 0, icon: Leaf, color: 'from-purple-500 to-purple-600', change: '+5' },
  ];

  const revenueChart = dash.revenueChart || [
    { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 62000 }, { month: 'Mar', revenue: 55000 },
    { month: 'Apr', revenue: 78000 }, { month: 'May', revenue: 92000 }, { month: 'Jun', revenue: 110000 },
  ];

  const quickLinks = [
    { label: 'Pending Farmers', count: dash.pendingFarmers || 0, path: '/admin/farmers', icon: Leaf, color: 'bg-amber-50 text-amber-600' },
    { label: 'Open Complaints', count: dash.openComplaints || 0, path: '/admin/complaints', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: 'Active Users', count: dash.activeUsers || 0, path: '/admin/users', icon: Users, color: 'bg-sky-50 text-sky-600' },
  ];

  return (
    <div id="admin-dashboard">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Admin Dashboard</h1>
      <p className="text-neutral-500 text-sm mb-6">Platform overview and quick actions</p>

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
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-neutral-900 mb-1">Revenue Overview</h3>
          <p className="text-sm text-neutral-500 mb-6">Monthly platform revenue</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a3a3a3' }} />
                <YAxis tick={{ fontSize: 12, fill: '#a3a3a3' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <Link key={i} to={link.path} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 group-hover:text-sky-600">{link.label}</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">{link.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
