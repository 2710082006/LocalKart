import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { isActive: true, isOrganic: false, stock: 1, price: 10 }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      images.forEach(img => formData.append('images', img));
      return productAPI.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['farmerProducts']);
      toast.success('Product added successfully!');
      navigate('/farmer/products');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add product'),
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) { toast.error('Max 4 images allowed'); return; }
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div id="farmer-add-product">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/farmer/products" className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Add New Product</h1>
          <p className="text-neutral-500 text-sm">List a new item in your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(mutation.mutate)} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Basic Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name</label>
                <input {...register('name', { required: 'Name is required' })} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Fresh Tomatoes" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea {...register('description', { required: 'Description is required' })} className={`input min-h-[120px] ${errors.description ? 'input-error' : ''}`} placeholder="Describe your product..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                  <select {...register('category', { required: 'Category is required' })} className="input appearance-none">
                    <option value="">Select Category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy</option>
                    <option value="grains">Grains</option>
                    <option value="spices">Spices</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Unit</label>
                  <select {...register('unit')} className="input appearance-none">
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                    <option value="liter">Liter (L)</option>
                    <option value="packet">Packet</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Pricing & Stock</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Price (₹)</label>
                <input type="number" {...register('price', { required: 'Price is required', min: 1 })} className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Available Stock</label>
                <input type="number" {...register('stock', { required: 'Stock is required', min: 0 })} className="input" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Product Images</h3>
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:bg-neutral-50 transition-colors relative cursor-pointer">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-sky-500" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">Click to upload images</p>
              <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 5MB (Max 4)</p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Status & Tags</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                <input type="checkbox" {...register('isActive')} className="w-5 h-5 rounded border-neutral-300 text-sky-500 focus:ring-sky-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Active Status</p>
                  <p className="text-xs text-neutral-500">Product visible to customers</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                <input type="checkbox" {...register('isOrganic')} className="w-5 h-5 rounded border-neutral-300 text-emerald-500 focus:ring-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">100% Organic</p>
                  <p className="text-xs text-neutral-500">Adds organic badge to product</p>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" disabled={mutation.isLoading} className="btn-primary w-full !py-3.5 shadow-lg shadow-sky-500/30">
            {mutation.isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
