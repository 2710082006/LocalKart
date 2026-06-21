import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Eye, Package, Search, MoreVertical, ToggleLeft, ToggleRight } from 'lucide-react';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['farmerProducts'],
    queryFn: () => productAPI.getAll({ myProducts: true }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['farmerProducts']); toast.success('Product deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const products = (data?.data || []).filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div id="farmer-products">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Products</h1>
          <p className="text-neutral-500 text-sm">{products.length} products listed</p>
        </div>
        <Link to="/farmer/products/add" className="btn-primary"><Plus className="w-5 h-5" /> Add Product</Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11" placeholder="Search products..." />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">No products yet</h3>
          <p className="text-neutral-500 mb-4">Start listing your fresh produce</p>
          <Link to="/farmer/products/add" className="btn-primary inline-flex"><Plus className="w-5 h-5" /> Add Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Stock</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                          <img src={product.images?.[0]?.url || 'https://placehold.co/80/f0f9ff/0ea5e9?text=P'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">{product.name}</p>
                          <p className="text-xs text-neutral-400">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="badge badge-sky">{product.category}</span></td>
                    <td className="px-5 py-4 font-semibold text-sm">₹{product.price}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${product.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/products/${product._id}`} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"><Eye className="w-4 h-4" /></Link>
                        <Link to={`/farmer/products/edit/${product._id}`} className="p-2 rounded-lg hover:bg-sky-50 text-sky-600"><Edit3 className="w-4 h-4" /></Link>
                        <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product._id); }} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
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
