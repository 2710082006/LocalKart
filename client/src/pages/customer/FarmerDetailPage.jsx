import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Star, Phone, Mail, Shield, Leaf, Clock, Package, ArrowLeft, ChevronRight } from 'lucide-react';
import { farmerAPI, reviewAPI } from '../../api';

export default function FarmerDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({ queryKey: ['farmer', id], queryFn: () => farmerAPI.getById(id).then(r => r.data) });
  const { data: productsData } = useQuery({ queryKey: ['farmerProducts', id], queryFn: () => farmerAPI.getProducts(id).then(r => r.data) });
  const { data: reviewsData } = useQuery({ queryKey: ['farmerReviews', id], queryFn: () => reviewAPI.getFarmerReviews(id).then(r => r.data) });

  const farmer = data?.data;
  const products = productsData?.data || [];
  const reviews = reviewsData?.data || [];

  if (isLoading) return (
    <div className="pt-20 pb-12 container">
      <div className="h-64 skeleton rounded-2xl mb-8" />
      <div className="h-8 skeleton w-1/3 mb-4" />
      <div className="h-4 skeleton w-1/2" />
    </div>
  );

  if (!farmer) return <div className="pt-20 pb-12 container text-center"><p className="text-xl text-neutral-500">Farmer not found</p></div>;

  return (
    <div className="pt-20 pb-12" id="farmer-detail-page">
      <div className="container">
        <Link to="/farmers" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-sky-600 mb-6"><ArrowLeft className="w-4 h-4" /> All Farmers</Link>

        {/* Hero banner */}
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-600 to-emerald-600 mb-8">
          {farmer.images?.[0]?.url && <img src={farmer.images[0].url} alt={farmer.farmName} className="w-full h-full object-cover opacity-40" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold">
                {farmer.userId?.name?.charAt(0)?.toUpperCase() || 'F'}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{farmer.farmName}</h1>
                <p className="text-white/80 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {farmer.location?.address || farmer.location?.city || 'India'}
                  {farmer.isVerified && <span className="badge badge-green">✓ Verified</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Package, label: 'Products', value: farmer.totalProducts || products.length },
            { icon: Star, label: 'Rating', value: farmer.rating?.average?.toFixed(1) || 'New' },
            { icon: Clock, label: 'Member Since', value: new Date(farmer.createdAt).getFullYear() },
            { icon: Shield, label: 'Status', value: farmer.isVerified ? 'Verified' : 'Pending' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-4 text-center">
                <Icon className="w-5 h-5 text-sky-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                <p className="text-xs text-neutral-500">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* About */}
        {farmer.description && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-neutral-900 mb-3">About the Farm</h2>
            <p className="text-neutral-600 leading-relaxed">{farmer.description}</p>
          </div>
        )}

        {/* Specialties */}
        {farmer.specialties?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-neutral-900 mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {farmer.specialties.map((s, i) => <span key={i} className="badge badge-sky">{s}</span>)}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-neutral-900 mb-5">Products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No products listed yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <Link key={p._id} to={`/products/${p._id}`} className="card group">
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    <img src={p.images?.[0]?.url || 'https://placehold.co/400x400/f0f9ff/0ea5e9?text=Product'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-neutral-800 truncate">{p.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sky-600">₹{p.price}<span className="text-xs text-neutral-400 font-normal">/{p.unit}</span></span>
                      {p.rating?.average > 0 && <span className="flex items-center gap-1 text-xs text-amber-600"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{p.rating.average}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-5">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No reviews yet</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.slice(0, 6).map((r) => (
                <div key={r._id} className="card-flat p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />)}
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{r.comment}</p>
                  <p className="text-xs text-neutral-500 font-medium">{r.userId?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
