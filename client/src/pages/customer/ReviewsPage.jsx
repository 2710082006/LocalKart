import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { productAPI } from '../../api'; // Assuming we'd have a user reviews endpoint, simulating for now

export default function ReviewsPage() {
  // Simulating reviews data
  const [filter, setFilter] = useState('all');

  const reviews = [
    { id: 1, product: { name: 'Fresh Organic Tomatoes', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80' }, rating: 5, comment: 'These tomatoes were incredibly fresh and juicy! Exactly what I was looking for. Will definitely buy again from this farmer.', date: '2026-06-15' },
    { id: 2, product: { name: 'Farm Fresh Eggs', image: 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=200&q=80' }, rating: 4, comment: 'Good quality eggs, packaging was secure. One egg was slightly cracked but overall satisfied.', date: '2026-06-10' },
  ];

  return (
    <div id="customer-reviews" className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">My Reviews</h1>
        <p className="text-neutral-500 text-sm">Manage your product reviews and ratings</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button className={`px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 text-white shadow`}>All Reviews ({reviews.length})</button>
        <button className={`px-4 py-2 rounded-xl text-sm font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200`}>To be Reviewed (3)</button>
      </div>

      <div className="space-y-4">
        {reviews.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 group hover:border-sky-200">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-neutral-100">
                <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-neutral-900">{review.product.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100 relative">
                  <MessageSquare className="w-4 h-4 text-neutral-300 absolute top-3 right-3" />
                  {review.comment}
                </p>
                <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                  <button className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
