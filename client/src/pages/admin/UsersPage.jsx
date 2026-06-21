import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Search, Ban, CheckCircle, MoreVertical, Mail, Phone, Shield } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', roleFilter],
    queryFn: () => adminAPI.getUsers({ role: roleFilter || undefined }).then(r => r.data),
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleUserStatus(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminUsers']); toast.success('User status updated'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const users = (data?.data || []).filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div id="admin-users">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">User Management</h1>
      <p className="text-neutral-500 text-sm mb-6">Manage all platform users</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11" placeholder="Search users..." />
        </div>
        <div className="flex gap-2">
          {['', 'customer', 'farmer', 'delivery', 'admin'].map((role) => (
            <button key={role} onClick={() => setRoleFilter(role)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === role ? 'bg-sky-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Joined</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">{user.name}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="badge badge-sky">{user.role}</span></td>
                    <td className="px-5 py-4 text-sm text-neutral-600">{user.phone || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${user.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                        {user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-500">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => suspendMutation.mutate(user._id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${user.isActive !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                        {user.isActive !== false ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
