import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Leaf, MapPin, TrendingUp, GripVertical, CheckCircle } from 'lucide-react';
import { adminAPI, farmerAPI } from '../../api';
import toast from 'react-hot-toast';

export default function FeaturedFarmersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminFeaturedFarmers'],
    queryFn: () => farmerAPI.getAll().then(r => r.data),
  });

  const featureMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleFeatured(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminFeaturedFarmers']); toast.success('Featured status updated'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  // Simulated list of all approved farmers
  const farmers = data?.data?.filter(f => f.isApproved !== false) || [];
  const featured = farmers.filter(f => f.isFeatured);
  const regular = farmers.filter(f => !f.isFeatured);

  return (
    <div id="admin-featured-farmers">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Featured Farmers</h1>
        <p className="text-neutral-500 text-sm">Manage which farmers appear on the landing page carousel</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Featured List */}
        <div>
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Currently Featured ({featured.length})</h3>
          
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
          ) : featured.length === 0 ? (
            <div className="card p-8 text-center border-dashed border-2">
              <Star className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No featured farmers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {featured.map((farmer, i) => (
                <motion.div key={farmer._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="card p-4 flex items-center justify-between group border-amber-200 bg-amber-50/30">
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab text-neutral-400 hover:text-neutral-600"><GripVertical className="w-5 h-5" /></div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {farmer.userId?.name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{farmer.farmName}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {farmer.location?.city}</p>
                    </div>
                  </div>
                  <button onClick={() => featureMutation.mutate(farmer._id)} className="btn-secondary !py-1.5 !px-3 !text-xs !text-red-600 hover:!bg-red-50 hover:!border-red-200">
                    Remove
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Available List */}
        <div>
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-500" /> Available to Feature</h3>
          
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
          ) : regular.length === 0 ? (
            <div className="card p-8 text-center border-dashed border-2">
              <CheckCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">All available farmers are already featured</p>
            </div>
          ) : (
            <div className="space-y-3">
              {regular.map((farmer, i) => (
                <div key={farmer._id} className="card p-4 flex items-center justify-between hover:border-sky-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold">
                      {farmer.userId?.name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{farmer.farmName}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {farmer.location?.city}</p>
                    </div>
                  </div>
                  <button onClick={() => featureMutation.mutate(farmer._id)} className="btn-primary !py-1.5 !px-3 !text-xs">
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
