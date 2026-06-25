import { useState } from 'react';
import { useParams, Link,useNavigate  } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Minus, Plus, MapPin, Clock, Shield, Truck, ChevronRight } from 'lucide-react';
import { productAPI, reviewAPI, wishlistAPI } from '../../api';
import { addToCart } from '../../features/cartSlice';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading } = useQuery({ queryKey: ['product', id], queryFn: () => productAPI.getById(id).then(r => r.data) });
  const { data: reviewsData } = useQuery({ queryKey: ['productReviews', id], queryFn: () => reviewAPI.getProductReviews(id).then(r => r.data) });

  const product = data?.data;
  const reviews = reviewsData?.data || [];

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product._id, quantity: qty }));
    toast.success(`${product.name} added to cart!`);
  };
const handleBuyNow = async () => {
  try {
    await dispatch(
      addToCart({
        productId: product._id,
        quantity: qty,
      })
    ).unwrap();

    navigate('/checkout'); // ya '/cart'
  } catch (err) {
    toast.error(err || 'Failed to proceed');
  }
};
  const handleWishlist = async () => {
    try {
      await wishlistAPI.add(product._id);
      toast.success('Added to wishlist!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  if (isLoading) return (
    <div className="pt-20 pb-12 container">
      <div className="grid lg:grid-cols-2 gap-10 mt-8">
        <div className="aspect-square skeleton rounded-2xl" />
        <div className="space-y-4"><div className="h-8 skeleton w-3/4" /><div className="h-4 skeleton w-1/2" /><div className="h-10 skeleton w-1/3" /><div className="h-24 skeleton" /></div>
      </div>
    </div>
  );

  if (!product) return <div className="pt-20 pb-12 container text-center"><p className="text-xl text-neutral-500">Product not found</p></div>;

  const images = product.images?.length ? product.images : [{ url: 'https://placehold.co/600x600/f0f9ff/0ea5e9?text=Product' }];
  const farmer = product.farmerId;

  return (
    <div className="pt-20 pb-12" id="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link to="/products" className="hover:text-sky-600">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-800 font-medium truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-4">
              <img src={images[selectedImage]?.url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-sky-500' : 'border-transparent'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.isOrganic && <span className="badge badge-green">🌿 Organic</span>}
              <span className="badge badge-sky">{product.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{product.name}</h1>

            {farmer && (
              <Link to={`/farmers/${farmer._id}`} className="flex items-center gap-2 text-neutral-500 hover:text-sky-600 mb-4 text-sm">
                <MapPin className="w-4 h-4" />
                {farmer.farmName} • {farmer.location?.city || 'Local'}
              </Link>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating?.average || 0) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />)}
              </div>
              <span className="text-sm text-neutral-500">{product.rating?.average || 0} ({product.rating?.count || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-sky-600">₹{product.price}</span>
              <span className="text-lg text-neutral-400">/{product.unit}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-neutral-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-medium mb-6 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} ${product.unit} available)` : '✗ Out of Stock'}
            </p>

            {/* Description */}
            <p className="text-neutral-600 text-sm leading-relaxed mb-8">{product.description}</p>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-neutral-200 rounded-xl">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-neutral-50"><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:bg-neutral-50"><Plus className="w-4 h-4" /></button>
                </div>
                
<div className="flex gap-3 flex-1">
  <button
    onClick={handleAddToCart}
    className="btn-outline flex-1 !py-3.5"
  >
    <ShoppingCart className="w-5 h-5" />
    Add to Cart
  </button>

  <button
    onClick={handleBuyNow}
    className="btn-primary flex-1 !py-3.5"
  >
    Buy Now
  </button>
</div>

                <button onClick={handleWishlist} className="p-3.5 rounded-xl border border-neutral-200 hover:bg-red-50 hover:border-red-200 transition-colors" id="add-to-wishlist">
                  <Heart className="w-5 h-5 text-neutral-400 hover:text-red-500" />
                </button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-2xl">
              {[
                { icon: Truck, label: product.deliveryEstimate || '1-2 hours' },
                { icon: Shield, label: 'Quality Assured' },
                { icon: Clock, label: product.shelfLife || 'Fresh' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="text-center">
                    <Icon className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                    <span className="text-xs text-neutral-600">{f.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Customer Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.slice(0, 6).map((r) => (
                <div key={r._id} className="card-flat p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />)}
                  </div>
                  {r.title && <h4 className="font-semibold text-sm text-neutral-800 mb-1">{r.title}</h4>}
                  <p className="text-sm text-neutral-600 mb-3">{r.comment}</p>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="font-medium text-neutral-600">{r.userId?.name}</span>
                    {r.isVerifiedPurchase && <span className="badge badge-green !text-[10px]">Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
