import { useState } from 'react';
import { Link, useSearchParams, } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, ChevronDown } from 'lucide-react';
import { productAPI } from '../../api';

const categories = ['All', 'vegetables', 'fruits', 'grains', 'pulses', 'dairy', 'spices', 'herbs', 'nuts', 'honey', 'oils', 'organic', 'millets', 'seeds'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, sort, page, searchParams.get('search')],
    queryFn: () => productAPI.getAll({ category: category || undefined, sort, page, search: searchParams.get('search') || undefined }).then(r => r.data),
  });

  const products = data?.data || [];
  const totalPages = data?.pages || 1;

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== 'page') newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchTerm);
  };

  return (
    <div className="pt-20 pb-12" id="products-page">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Fresh Products</h1>
          <p className="text-neutral-500">Browse farm-fresh produce from local farmers</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border border-neutral-200 rounded-2xl bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-sm hover:border-neutral-300"
              placeholder="Search products..."
              id="search-products"
            />
          </form>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="w-full sm:w-auto px-4 py-3 pr-10 text-base border border-neutral-200 rounded-2xl bg-white text-neutral-800 outline-none transition-all duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-sm hover:border-neutral-300 appearance-none cursor-pointer font-medium"
                id="sort-products"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center p-3 border border-neutral-200 rounded-2xl bg-white text-neutral-700 outline-none transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 focus:ring-4 focus:ring-sky-500/10 shadow-sm cursor-pointer ${
                showFilters ? 'bg-sky-50 border-sky-300 text-sky-600' : ''
              }`}
              id="toggle-filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-[1.02]'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 border border-transparent'
              }`}
              id={`cat-${cat}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-flat">
                <div className="aspect-square skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-5 skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 max-w-md mx-auto text-center mt-12 shadow-sm">
            <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-[family-name:var(--font-display)]">No products found</h3>
            <p className="text-neutral-500 text-sm max-w-xs mb-8 leading-relaxed">Try adjusting your search terms or clearing the filters to discover more products.</p>
            <button onClick={() => { setSearchParams({}); setSearchTerm(''); }} className="btn-primary !px-8 !py-3.5 !rounded-2xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all duration-300">Clear Filters</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-4">{data?.total || products.length} products found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/products/${p._id}`} className="card group">
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <img src={p.images?.[0]?.url || 'https://placehold.co/400x400/f0f9ff/0ea5e9?text=Product'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      {p.isOrganic && <span className="absolute top-2 left-2 badge badge-green">Organic</span>}
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="absolute top-2 right-2 badge badge-red">-{Math.round((1 - p.price / p.originalPrice) * 100)}%</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-neutral-800 truncate mb-1">{p.name}</p>
                      <p className="text-xs text-neutral-500 mb-2 truncate">{p.farmerId?.farmName || 'Local Farm'}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sky-600">₹{p.price}</span>
                          <span className="text-xs text-neutral-400">/{p.unit}</span>
                          {p.originalPrice && p.originalPrice > p.price && <span className="text-xs text-neutral-400 line-through ml-2">₹{p.originalPrice}</span>}
                        </div>
                        {p.rating?.average > 0 && <span className="flex items-center gap-1 text-xs text-amber-600"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{p.rating.average}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => updateParam('page', String(i + 1))} className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${page === i + 1 ? 'bg-sky-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
