import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Search, AlertTriangle, Plus, Minus, Save, RotateCw } from 'lucide-react';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [stockUpdates, setStockUpdates] = useState({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['farmerInventory'],
    queryFn: () => productAPI.getAll({ myProducts: true }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }) => productAPI.update(id, { stock }),
    onSuccess: () => { queryClient.invalidateQueries(['farmerInventory']); setStockUpdates({}); toast.success('Stock updated'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const products = (data?.data || []).filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const handleStockChange = (id, currentStock, delta) => {
    const newVal = Math.max(0, (stockUpdates[id] !== undefined ? stockUpdates[id] : currentStock) + delta);
    setStockUpdates({ ...stockUpdates, [id]: newVal });
  };

  const handleSaveAll = () => {
    const promises = Object.entries(stockUpdates).map(([id, stock]) => updateMutation.mutateAsync({ id, stock }));
    Promise.all(promises).then(() => {
      toast.success('All inventory updated!');
    });
  };

  return (
    <div id="farmer-inventory">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Inventory Management</h1>
          <p className="text-neutral-500 text-sm">Quickly update your product stock levels</p>
        </div>
        {Object.keys(stockUpdates).length > 0 && (
          <button onClick={handleSaveAll} disabled={updateMutation.isLoading} className="btn-primary shadow-lg shadow-sky-500/20">
            {updateMutation.isLoading ? <RotateCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save All Changes
          </button>
        )}
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
            <p className="text-sm text-amber-700">You have {lowStockProducts.length} product(s) running low on stock. Please update their inventory.</p>
          </div>
        </div>
      )}

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-11" placeholder="Search by product name..." />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 card">
          <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 mb-2">No inventory found</h3>
          <p className="text-neutral-500">Add some products first to manage their stock.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Category</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Current Stock</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Update Stock</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const currentVal = stockUpdates[product._id] !== undefined ? stockUpdates[product._id] : product.stock;
                  const isModified = stockUpdates[product._id] !== undefined && stockUpdates[product._id] !== product.stock;
                  const isLow = currentVal <= 5;

                  return (
                    <tr key={product._id} className={`border-b border-neutral-50 transition-colors ${isModified ? 'bg-sky-50/30' : 'hover:bg-neutral-50/50'}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                            <img src={product.images?.[0]?.url || 'https://placehold.co/80/f0f9ff/0ea5e9?text=P'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-800">{product.name}</p>
                            <p className="text-xs text-neutral-400">₹{product.price} / {product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className="badge badge-sky">{product.category}</span></td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-neutral-700'}`}>{product.stock} {product.unit}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white">
                            <button onClick={() => handleStockChange(product._id, product.stock, -1)} className="p-2 hover:bg-neutral-50 text-neutral-600"><Minus className="w-4 h-4" /></button>
                            <input
                              type="number"
                              className="w-16 text-center text-sm font-semibold border-none focus:ring-0 p-0"
                              value={currentVal}
                              onChange={(e) => setStockUpdates({ ...stockUpdates, [product._id]: Math.max(0, parseInt(e.target.value) || 0) })}
                            />
                            <button onClick={() => handleStockChange(product._id, product.stock, 1)} className="p-2 hover:bg-neutral-50 text-neutral-600"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isModified ? (
                          <button onClick={() => updateMutation.mutate({ id: product._id, stock: currentVal })} className="btn-primary !py-1.5 !px-3 !text-xs shadow-sm">Save</button>
                        ) : (
                          <span className="text-xs text-neutral-400">Synced</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
