import { useQuery } from '@tanstack/react-query';
import { DollarSign, ArrowUpRight, TrendingUp, Calendar, ArrowDownRight, Wallet } from 'lucide-react';
import { deliveryAPI } from '../../api';

export default function EarningsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['deliveryEarnings'], queryFn: () => deliveryAPI.getEarnings().then(r => r.data) });
  
  const earnings = data?.data || {};
  const history = [
    { date: '2026-06-20', amount: 850, deliveries: 12, status: 'paid' },
    { date: '2026-06-19', amount: 620, deliveries: 9, status: 'paid' },
    { date: '2026-06-18', amount: 940, deliveries: 14, status: 'paid' },
    { date: '2026-06-17', amount: 510, deliveries: 7, status: 'paid' },
  ];

  return (
    <div id="delivery-earnings" className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Earnings & Payouts</h1>
        <p className="text-neutral-500 text-sm">Track your daily income and weekly payouts</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <Wallet className="w-5 h-5" />
            <span className="font-medium text-sm">Available Balance</span>
          </div>
          <p className="text-4xl font-bold mb-1">₹{earnings.thisMonth || 0}</p>
          <p className="text-sm opacity-80">Pending payout on Friday</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4 text-neutral-500">
            <DollarSign className="w-5 h-5 text-sky-500" />
            <span className="font-medium text-sm">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mb-1">₹{earnings.total || 0}</p>
          <p className="text-sm text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Lifetime</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4 text-neutral-500">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-sm">Average/Delivery</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900 mb-1">₹{earnings.average || 45}</p>
          <p className="text-sm text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +5% vs last week</p>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-neutral-900">Recent Payouts</h3>
          <button className="text-sm font-semibold text-sky-600 hover:text-sky-700">Download Statement</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase">Deliveries</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {history.map((row, i) => (
                <tr key={i} className="hover:bg-neutral-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-800">{new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{row.deliveries} trips</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{row.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="badge badge-green text-xs capitalize">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
