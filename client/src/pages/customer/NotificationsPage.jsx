import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Package, Tag, Star, Clock } from 'lucide-react';
import { notificationAPI } from '../../api';

export default function NotificationsPage() {
  // Using a simulated local state or a dedicated endpoint for notifications
  // Assuming a generic userAPI endpoint or we'll mock the data for now.
  const { isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationAPI.getAll().then(r => r.data) });

  const notifications = [
    { id: 1, type: 'order', title: 'Order Delivered', message: 'Your order #ORD-5839 has been delivered successfully.', time: '10 mins ago', read: false },
    { id: 2, type: 'promo', title: 'Weekend Sale!', message: 'Get 20% off on all organic fruits this weekend. Use code FRESH20.', time: '2 hours ago', read: false },
    { id: 3, type: 'order', title: 'Out for Delivery', message: 'Your order #ORD-5839 is out for delivery and will reach you soon.', time: '5 hours ago', read: true },
    { id: 4, type: 'system', title: 'Review your purchase', message: 'How were the fresh tomatoes? Leave a review and earn points!', time: '1 day ago', read: true },
    { id: 5, type: 'promo', title: 'New Farmer added', message: 'Green Valley Farm has joined Farm2Door. Check out their fresh dairy products.', time: '2 days ago', read: true },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'order': return <Package className="w-5 h-5 text-sky-500" />;
      case 'promo': return <Tag className="w-5 h-5 text-emerald-500" />;
      case 'system': return <Star className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-neutral-500" />;
    }
  };

  const getBg = (type) => {
    switch(type) {
      case 'order': return 'bg-sky-50';
      case 'promo': return 'bg-emerald-50';
      case 'system': return 'bg-amber-50';
      default: return 'bg-neutral-50';
    }
  };

  return (
    <div id="customer-notifications" className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Notifications</h1>
          <p className="text-neutral-500 text-sm">Stay updated with your orders and offers</p>
        </div>
        <button className="text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">Mark all as read</button>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {notifications.map((notif, i) => (
            <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`p-5 flex gap-4 transition-colors hover:bg-neutral-50 ${!notif.read ? 'bg-sky-50/20' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${getBg(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`font-semibold ${!notif.read ? 'text-neutral-900' : 'text-neutral-700'}`}>{notif.title}</h3>
                  <span className="text-xs text-neutral-400 flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" /> {notif.time}</span>
                </div>
                <p className={`text-sm ${!notif.read ? 'text-neutral-700' : 'text-neutral-500'}`}>{notif.message}</p>
              </div>
              {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-2 shrink-0" />}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
