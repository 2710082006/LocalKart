import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Eye, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { orderAPI } from '../../api';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', statusFilter],
    queryFn: () => orderAPI.getAll({ status: statusFilter || undefined }).then(r => r.data),
  });

  const orders = (data?.data || []).filter(o => 
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || 
    o.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.farmerId?.farmName?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed': return <span className="badge badge-sky"><Clock className="w-3 h-3 mr-1" /> Placed</span>;
      case 'confirmed': return <span className="badge badge-amber"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'packed': return <span className="badge badge-purple"><ShoppingBag className="w-3 h-3 mr-1" /> Packed</span>;
      case 'out_for_delivery': return <span className="badge badge-indigo"><Truck className="w-3 h-3 mr-1" /> Out</span>;
      case 'delivered': return <span className="badge badge-green"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</span>;
      case 'cancelled': return <span className="badge badge-red"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div id="admin-orders">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Order Management</h1>
      <p className="text-neutral-500 text-sm mb-6">Monitor and manage all platform orders</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="input pl-11" 
            placeholder="Search by order #, customer, or farm..." 
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
            <button 
              key={status} 
              onClick={() => setStatusFilter(status)} 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Order Details</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Farm</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-neutral-800">#{order.orderNumber}</p>
                      <p className="text-xs text-neutral-500">{order.items.length} item(s)</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-neutral-800">{order.customerId?.name || 'Unknown'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-neutral-800">{order.farmerId?.farmName || 'Unknown Farm'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-neutral-800">₹{order.totalAmount}</p>
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {/* Using the default view order page for admins as well */}
                      <Link 
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No orders found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
