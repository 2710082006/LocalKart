import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const { data, isLoading } = useQuery({ queryKey: ['product', id], queryFn: () => productAPI.getById(id).then(r => r.data) });
  const product = data?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name, description: product.description,
        category: product.category, unit: product.unit,
        price: product.price, stock: product.stock,
        isActive: product.isActive, isOrganic: product.isOrganic
      });
      setExistingImages(product.images || []);
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      images.forEach(img => data.append('images', img));
      data.append('existingImages', JSON.stringify(existingImages.map(img => img.public_id)));
      return productAPI.update(id, data); // API needs to support multipart update or separate endpoints. Assuming multipart for simplicity.
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['farmerProducts']);
      queryClient.invalidateQueries(['product', id]);
      toast.success('Product updated!');
      navigate('/farmer/products');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length + existingImages.length > 4) { toast.error('Max 4 images allowed'); return; }
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) return <div className="p-8"><div className="h-64 skeleton rounded-2xl" /></div>;

  return (
    <div id="farmer-edit-product">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/farmer/products" className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Edit Product</h1>
          <p className="text-neutral-500 text-sm">Update {product?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(mutation.mutate)} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Basic Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name</label>
                <input {...register('name', { required: 'Required' })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea {...register('description', { required: 'Required' })} className="input min-h-[120px]" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                  <select {...register('category')} className="input">
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
                  <select {...register('unit')} className="input">
                    <option value="kg">Kilogram (kg)</option>
                    <option value="piece">Piece</option>
                    <option value="liter">Liter (L)</option>
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
                <input type="number" {...register('price', { required: 'Required' })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Available Stock</label>
                <input type="number" {...register('stock', { required: 'Required' })} className="input" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Product Images</h3>
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:bg-neutral-50 relative cursor-pointer">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <Upload className="w-6 h-6 text-sky-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-800">Add more images</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {existingImages.map((img, i) => (
                <div key={`ext-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group">
                  <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {previews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-sky-200 group">
                  <img src={src} alt="New" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-sky-500 text-white text-[10px] text-center py-0.5">NEW</span>
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Status & Tags</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="w-5 h-5 rounded text-sky-500" />
                <span className="text-sm font-semibold text-neutral-800">Active Status</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer">
                <input type="checkbox" {...register('isOrganic')} className="w-5 h-5 rounded text-emerald-500" />
                <span className="text-sm font-semibold text-neutral-800">100% Organic</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={mutation.isLoading} className="btn-primary w-full !py-3.5">
            {mutation.isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Update Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
