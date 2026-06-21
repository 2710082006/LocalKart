import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { MapPin, Plus, Trash2, Edit2, Home, Briefcase, Star, X } from 'lucide-react';
import { addressAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AddressPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['userAddresses'], queryFn: () => addressAPI.getAll().then(r => r.data) });
  const addresses = data?.data || [];

  const addMutation = useMutation({
    mutationFn: (address) => addressAPI.create(address),
    onSuccess: () => { queryClient.invalidateQueries(['userAddresses']); setIsModalOpen(false); reset(); toast.success('Address added'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => addressAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['userAddresses']); toast.success('Address removed'); },
  });

  const onSubmit = (data) => {
    // If editing, we would typically call update. We'll simulate with add for now or a generic endpoint
    addMutation.mutate({ ...data, isDefault: addresses.length === 0 });
  };

  const getIcon = (type) => {
    if (type === 'work') return <Briefcase className="w-5 h-5" />;
    return <Home className="w-5 h-5" />;
  };

  return (
    <div id="customer-addresses" className="max-w-4xl mx-auto relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">My Addresses</h1>
          <p className="text-neutral-500 text-sm">Manage your delivery locations</p>
        </div>
        <button onClick={() => { setEditingId(null); reset(); setIsModalOpen(true); }} className="btn-primary !py-2.5">
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <div key={i} className="h-40 skeleton rounded-xl" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2">
          <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-800 mb-2">No saved addresses</h3>
          <p className="text-neutral-500 text-sm mb-4">Add your home or work address for faster checkout.</p>
          <button onClick={() => { setEditingId(null); reset(); setIsModalOpen(true); }} className="btn-secondary !py-2">Add Address</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address, i) => (
            <motion.div key={address._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 group hover:border-sky-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                    {getIcon(address.type)}
                  </div>
                  <span className="font-bold text-neutral-900 capitalize">{address.type || 'Home'}</span>
                  {address.isDefault && <span className="badge badge-sky ml-2 text-[10px]">Default</span>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-neutral-400 hover:text-sky-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteMutation.mutate(address._id)} className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="font-semibold text-neutral-800 text-sm">{address.fullName || 'User'}</p>
              <p className="text-neutral-600 text-sm mt-1 leading-relaxed">{address.street}, {address.city}, {address.state} - {address.zipCode}</p>
              <p className="text-neutral-500 text-sm mt-1">{address.phone}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
                  <input {...register('fullName', { required: true })} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Phone</label>
                  <input {...register('phone', { required: true })} className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Street Address</label>
                <textarea {...register('street', { required: true })} className="input text-sm min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">City</label>
                  <input {...register('city', { required: true })} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">ZIP Code</label>
                  <input {...register('zipCode', { required: true })} className="input text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">State</label>
                  <input {...register('state', { required: true })} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Type</label>
                  <select {...register('type')} className="input text-sm">
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={addMutation.isLoading} className="btn-primary w-full mt-4">
                {addMutation.isLoading ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
