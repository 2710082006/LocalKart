import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, DollarSign, CheckCircle, Package, MapPin, Calendar } from 'lucide-react';
import { deliveryAPI } from '../../api';

export default function HistoryPage() {
  const { data, isLoading } = useQuery({ queryKey: ['deliveryHistory'], queryFn: () => deliveryAPI.getHistory().then(r => r.data), retry: false });
  const { data: earningsData } = useQuery({ queryKey: ['deliveryEarnings'], queryFn: () => deliveryAPI.getEarnings().then(r => r.data), retry: false });

  const deliveries = data?.data || [];
  const earnings = earningsData?.data || {};

  return (
    <div id="delivery-history">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Delivery History & Earnings</h1>
      <p className="text-neutral-500 text-sm mb-6">Your completed deliveries and earnings overview</p>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earnings', value: `₹${(earnings.total || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
          { label: 'This Month', value: `₹${(earnings.thisMonth || 0).toLocaleString()}`, icon: Calendar, color: 'from-sky-500 to-sky-600' },
          { label: 'Deliveries Made', value: earnings.totalDeliveries || deliveries.length, icon: CheckCircle, color: 'from-amber-500 to-amber-600' },
          { label: 'Avg per Delivery', value: `₹${earnings.average || 0}`, icon: Package, color: 'from-purple-500 to-purple-600' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Delivery History */}
      <div className="card p-6">
        <h3 className="font-bold text-neutral-900 mb-5">Completed Deliveries</h3>
        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No deliveries yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d, i) => (
              <motion.div key={d._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${d.status === 'delivered' ? 'bg-emerald-50' : 'bg-neutral-100'}`}>
                    <CheckCircle className={`w-5 h-5 ${d.status === 'delivered' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">#{d.orderNumber}</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {d.deliveryAddress?.city || 'Local'} •
                      <Clock className="w-3 h-3 ml-1" /> {new Date(d.deliveredAt || d.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">₹{d.deliveryFee || 30}</p>
                  <span className={`text-[10px] font-semibold uppercase ${d.status === 'delivered' ? 'text-emerald-600' : 'text-neutral-400'}`}>{d.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
