import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Leaf } from 'lucide-react';
import { adminAPI } from '../../api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const { data } = useQuery({ queryKey: ['adminAnalytics'], queryFn: () => adminAPI.getAnalytics().then(r => r.data), retry: false });

  const analytics = data?.data || {};

  const userGrowth = analytics.userGrowth || [
    { month: 'Jan', customers: 120, farmers: 8, delivery: 5 },
    { month: 'Feb', customers: 180, farmers: 12, delivery: 8 },
    { month: 'Mar', customers: 250, farmers: 15, delivery: 10 },
    { month: 'Apr', customers: 380, farmers: 22, delivery: 14 },
    { month: 'May', customers: 520, farmers: 30, delivery: 18 },
    { month: 'Jun', customers: 700, farmers: 38, delivery: 24 },
  ];

  const ordersByStatus = analytics.ordersByStatus || [
    { name: 'Delivered', value: 65 }, { name: 'In Transit', value: 15 }, { name: 'Processing', value: 12 }, { name: 'Cancelled', value: 8 },
  ];

  const revenueByCategory = analytics.revenueByCategory || [
    { category: 'Vegetables', revenue: 45000 }, { category: 'Fruits', revenue: 32000 }, { category: 'Dairy', revenue: 18000 },
    { category: 'Grains', revenue: 15000 }, { category: 'Spices', revenue: 8000 }, { category: 'Others', revenue: 5000 },
  ];

  return (
    <div id="admin-analytics">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Platform Analytics</h1>
      <p className="text-neutral-500 text-sm mb-6">Detailed platform performance metrics</p>

      {/* User Growth */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-neutral-900 mb-1">User Growth</h3>
        <p className="text-sm text-neutral-500 mb-6">Monthly user signups by role</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="cust" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient>
                <linearGradient id="farm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a3a3a3' }} />
              <YAxis tick={{ fontSize: 12, fill: '#a3a3a3' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5' }} />
              <Legend />
              <Area type="monotone" dataKey="customers" stroke="#0ea5e9" strokeWidth={2} fill="url(#cust)" />
              <Area type="monotone" dataKey="farmers" stroke="#10b981" strokeWidth={2} fill="url(#farm)" />
              <Area type="monotone" dataKey="delivery" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.1} fill="#f59e0b" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-1">Orders by Status</h3>
          <p className="text-sm text-neutral-500 mb-6">Distribution of order statuses</p>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-1">Revenue by Category</h3>
          <p className="text-sm text-neutral-500 mb-6">Sales breakdown</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#a3a3a3' }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 12, fill: '#a3a3a3' }} width={80} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5' }} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
