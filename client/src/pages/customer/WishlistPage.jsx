import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, Star, MapPin } from 'lucide-react';
import { wishlistAPI } from '../../api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cartSlice';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then(r => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistAPI.remove(productId),
    onSuccess: () => { queryClient.invalidateQueries(['wishlist']); toast.success('Removed from wishlist'); },
  });

  const items = data?.data || [];

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-12 container">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card-flat"><div className="aspect-square skeleton" /><div className="p-4 space-y-2"><div className="h-4 skeleton w-3/4" /><div className="h-5 skeleton w-1/3" /></div></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12" id="wishlist-page">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Wishlist</h1>
            <p className="text-neutral-500 mt-1">{items.length} saved items</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-800 mb-2">Your wishlist is empty</h3>
            <p className="text-neutral-500 mb-6">Save your favorite products for later</p>
            <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product, i) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="card group relative">
                  <button
                    onClick={() => removeMutation.mutate(product._id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-50 shadow transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-square overflow-hidden bg-neutral-100">
                      <img src={product.images?.[0]?.url || 'https://placehold.co/400x400/f0f9ff/0ea5e9?text=Product'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <p className="text-sm font-semibold text-neutral-800 truncate mb-1 hover:text-sky-600">{product.name}</p>
                    </Link>
                    <p className="text-xs text-neutral-500 mb-2">{product.farmerId?.farmName || 'Local Farm'}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sky-600">₹{product.price}<span className="text-xs text-neutral-400 font-normal">/{product.unit}</span></span>
                      {product.rating?.average > 0 && <span className="flex items-center gap-1 text-xs text-amber-600"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{product.rating.average}</span>}
                    </div>
                    <button onClick={() => handleAddToCart(product)} className="btn-primary w-full !py-2 !text-sm" id={`wishlist-cart-${product._id}`}>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
