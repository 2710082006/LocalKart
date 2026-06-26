import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Leaf, CheckCircle, XCircle, MapPin, Star, Clock, Eye, Phone, Mail } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function FarmersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['pendingFarmers'], queryFn: () => adminAPI.getPendingFarmers().then(r => r.data) });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }) => adminAPI.approveFarmer(id, { status: approved ? 'approved' : 'rejected' }),
    onSuccess: () => { queryClient.invalidateQueries(['pendingFarmers']); toast.success('Updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const featureMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleFeatured(id),
    onSuccess: () => { queryClient.invalidateQueries(['pendingFarmers']); toast.success('Featured status toggled'); },
  });

  const farmers = data?.data || [];

  return (
    <div id="admin-farmers">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Farmer Management</h1>
      <p className="text-neutral-500 text-sm mb-6">Approve new farmers and manage featured listings</p>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}</div>
      ) : farmers.length === 0 ? (
        <div className="text-center py-20">
          <Leaf className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">No pending approvals</h3>
          <p className="text-neutral-500">All farmer applications have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {farmers.map((farmer, i) => (
            <motion.div key={farmer._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {farmer.userId?.name?.charAt(0)?.toUpperCase() || 'F'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">{farmer.farmName}</h3>
                    <p className="text-sm text-neutral-600 flex items-center gap-1 mt-0.5">
                      <span className="font-medium">{farmer.userId?.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
                      {farmer.location?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.location.city}, {farmer.location.state}</span>}
                      {farmer.userId?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{farmer.userId.phone}</span>}
                      {farmer.userId?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{farmer.userId.email}</span>}
                    </div>
                    {farmer.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {farmer.specialties.map((s, j) => <span key={j} className="badge badge-sky !text-[10px]">{s}</span>)}
                      </div>
                    )}
                    {farmer.description && <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{farmer.description}</p>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-shrink-0">
                  <span className={`badge ${farmer.isApproved === 'approved' ? 'badge-green' : farmer.isApproved === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                    {farmer.isApproved === 'approved' ? 'Approved' : farmer.isApproved === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                  <div className="flex gap-2">
                    {farmer.isApproved === 'pending' && (
                      <>
                        <button onClick={() => approveMutation.mutate({ id: farmer._id, approved: true })} className="btn-primary !py-2 !px-4 !text-sm">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => approveMutation.mutate({ id: farmer._id, approved: false })} className="btn-secondary !py-2 !px-4 !text-sm text-red-500 !border-red-200 hover:!bg-red-50">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => featureMutation.mutate(farmer._id)} className={`btn-ghost !text-sm ${farmer.isFeatured ? 'text-amber-600' : ''}`}>
                      {farmer.isFeatured ? '⭐ Featured' : '☆ Feature'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Applied {new Date(farmer.createdAt).toLocaleDateString('en-IN')}</span>
                <span>{farmer.totalProducts || 0} products</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
