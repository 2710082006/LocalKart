import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, User, ChevronRight } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ComplaintsPage() {
  const [filter, setFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolution, setResolution] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminComplaints', filter],
    queryFn: () => adminAPI.getComplaints({ status: filter || undefined }).then(r => r.data),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.resolveComplaint(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminComplaints']); setSelectedComplaint(null); setResolution(''); toast.success('Complaint resolved!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const complaints = data?.data || [];
  const statusColors = { open: 'badge-red', in_progress: 'badge-amber', resolved: 'badge-green', closed: 'badge-sky' };

  return (
    <div id="admin-complaints">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Complaints</h1>
      <p className="text-neutral-500 text-sm mb-6">Manage customer complaints and issues</p>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filter === s ? 'bg-sky-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            {s ? s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">No complaints</h3>
          <p className="text-neutral-500">All clear! No complaints to handle.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {complaints.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-neutral-900">{c.subject}</h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-2 mt-1">
                    <User className="w-3 h-3" /> {c.userId?.name || 'Customer'} •
                    <Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`badge ${statusColors[c.status] || 'badge-sky'}`}>{c.status?.replace(/_/g, ' ')}</span>
              </div>

              <p className="text-sm text-neutral-600 line-clamp-2 mb-4">{c.description}</p>

              {c.orderId && <p className="text-xs text-neutral-400 mb-3">Order: #{c.orderId?.orderNumber || c.orderId}</p>}

              {c.status !== 'resolved' && c.status !== 'closed' && (
                selectedComplaint === c._id ? (
                  <div className="space-y-3">
                    <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} className="input min-h-[80px] text-sm" placeholder="Enter resolution notes..." />
                    <div className="flex gap-2">
                      <button onClick={() => resolveMutation.mutate({ id: c._id, data: { resolution, status: 'resolved' } })} className="btn-primary !py-2 !text-sm flex-1">
                        <CheckCircle className="w-4 h-4" /> Resolve
                      </button>
                      <button onClick={() => { setSelectedComplaint(null); setResolution(''); }} className="btn-ghost !py-2 !text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSelectedComplaint(c._id)} className="btn-secondary !py-2 !text-sm w-full">
                    <MessageSquare className="w-4 h-4" /> Respond
                  </button>
                )
              )}

              {c.resolution?.notes && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Resolution:</p>
                  <p className="text-xs text-emerald-600">{c.resolution.notes}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
