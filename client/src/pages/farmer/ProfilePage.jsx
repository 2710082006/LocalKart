import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail, Save, Leaf, Shield, Upload, Building } from 'lucide-react';
import { farmerAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ['farmerProfile'], queryFn: () => farmerAPI.getDashboard().then(r => r.data), retry: false });
  const farmer = data?.data?.farmer || {};

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: {
      farmName: farmer.farmName || '',
      description: farmer.description || '',
      phone: user?.phone || '',
      address: farmer.location?.address || '',
      city: farmer.location?.city || '',
      state: farmer.location?.state || '',
      pincode: farmer.location?.pincode || '',
      specialties: farmer.specialties?.join(', ') || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => farmerAPI.updateProfile(data),
    onSuccess: () => { queryClient.invalidateQueries(['farmerProfile']); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      specialties: data.specialties.split(',').map(s => s.trim()).filter(Boolean),
      location: { address: data.address, city: data.city, state: data.state, pincode: data.pincode },
    });
  };

  return (
    <div id="farmer-profile">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Farm Profile</h1>
      <p className="text-neutral-500 text-sm mb-6">Manage your farm details and information</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* Profile Header */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{user?.name}</h2>
              <p className="text-sm text-neutral-500">{user?.email}</p>
              <span className="badge badge-green mt-1">Farmer</span>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-500" /> Farm Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Farm Name</label>
              <input {...register('farmName', { required: 'Farm name is required' })} className={`input ${errors.farmName ? 'input-error' : ''}`} />
              {errors.farmName && <p className="text-red-500 text-xs mt-1">{errors.farmName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea {...register('description')} className="input min-h-[100px] resize-y" placeholder="Tell customers about your farm..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Specialties (comma separated)</label>
              <input {...register('specialties')} className="input" placeholder="Organic Vegetables, Fruits, Dairy" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-sky-500" /> Location</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
              <input {...register('address')} className="input" placeholder="Street address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
              <input {...register('city')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
              <input {...register('state')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Pincode</label>
              <input {...register('pincode')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
              <input {...register('phone')} className="input" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={mutation.isLoading} className="btn-primary !py-3.5">
          {mutation.isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
