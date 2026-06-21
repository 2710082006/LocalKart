import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import { farmerAPI } from '../../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['farmerAnalytics'], queryFn: () => farmerAPI.getAnalytics().then(r => r.data), retry: false });

  const analytics = data?.data || {};
  const revenueData = analytics.revenueChart || [
    { month: 'Jan', revenue: 12000 }, { month: 'Feb', revenue: 18000 }, { month: 'Mar', revenue: 15000 },
    { month: 'Apr', revenue: 22000 }, { month: 'May', revenue: 28000 }, { month: 'Jun', revenue: 35000 },
  ];
  const categoryData = analytics.categoryBreakdown || [
    { name: 'Vegetables', value: 40 }, { name: 'Fruits', value: 25 }, { name: 'Dairy', value: 15 },
    { name: 'Grains', value: 12 }, { name: 'Others', value: 8 },
  ];
  const ordersData = analytics.ordersChart || [
    { month: 'Jan', orders: 45 }, { month: 'Feb', orders: 62 }, { month: 'Mar', orders: 55 },
    { month: 'Apr', orders: 78 }, { month: 'May', orders: 92 }, { month: 'Jun', orders: 110 },
  ];

  return (
    <div id="farmer-analytics">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Analytics</h1>
      <p className="text-neutral-500 text-sm mb-6">Track your farm's performance</p>

      {/* Revenue Chart */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-neutral-900 mb-1">Revenue Overview</h3>
        <p className="text-sm text-neutral-500 mb-6">Monthly revenue trend</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a3a3a3' }} />
              <YAxis tick={{ fontSize: 12, fill: '#a3a3a3' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Orders Chart */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-1">Orders Trend</h3>
          <p className="text-sm text-neutral-500 mb-6">Monthly orders</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a3a3a3' }} />
                <YAxis tick={{ fontSize: 12, fill: '#a3a3a3' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5' }} />
                <Bar dataKey="orders" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-1">Sales by Category</h3>
          <p className="text-sm text-neutral-500 mb-6">Revenue distribution</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-neutral-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
