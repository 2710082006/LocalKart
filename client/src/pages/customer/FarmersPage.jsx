import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Leaf, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { farmerAPI } from '../../api';

export default function FarmersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const page = parseInt(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ['farmers', page, searchParams.get('search')],
    queryFn: () => farmerAPI.getAll({ page, search: searchParams.get('search') || undefined }).then(r => r.data),
  });

  const farmers = data?.data || [];

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (search) p.set('search', search); else p.delete('search');
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="pt-20 pb-12" id="farmers-page">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Local Farmers</h1>
          <p className="text-neutral-500">Discover verified farmers near you</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-8 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-12" placeholder="Search farmers by name, location..." id="search-farmers" />
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-flat"><div className="h-48 skeleton" /><div className="p-5 space-y-3"><div className="h-5 skeleton w-2/3" /><div className="h-4 skeleton w-1/2" /><div className="h-4 skeleton w-1/3" /></div></div>
            ))}
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No farmers found</h3>
            <p className="text-neutral-500">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map((farmer, i) => (
              <motion.div key={farmer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/farmers/${farmer._id}`} className="card group block">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-sky-100 to-emerald-100">
                    {farmer.images?.[0]?.url ? (
                      <img src={farmer.images[0].url} alt={farmer.farmName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-16 h-16 text-emerald-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{farmer.farmName}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {farmer.location?.city || farmer.location?.state || 'India'}</p>
                    </div>
                    {farmer.rating?.average > 0 && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold flex items-center gap-1 text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {farmer.rating.average.toFixed(1)}
                      </div>
                    )}
                    {farmer.isVerified && <span className="absolute top-3 left-3 badge badge-green">Verified</span>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {farmer.userId?.name?.charAt(0)?.toUpperCase() || 'F'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">{farmer.userId?.name || 'Farmer'}</p>
                        <p className="text-xs text-neutral-500">{farmer.specialties?.slice(0, 2).join(', ') || 'Fresh Produce'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{farmer.totalProducts || 0} products</span>
                      <span className="text-sky-600 font-semibold group-hover:underline flex items-center gap-1">Visit Farm <ChevronRight className="w-4 h-4" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
