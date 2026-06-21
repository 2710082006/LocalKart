const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const { asyncHandler, getPagination, uploadMultiple } = require('../utils/helpers');

// @desc    Get all products (with filters)
// @route   GET /api/v1/products
exports.getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { category, minPrice, maxPrice, search, sort, isOrganic, rating, farmerId } = req.query;

  let query = { isAvailable: true };

  if (category) query.category = category;
  if (farmerId) query.farmerId = farmerId;
  if (isOrganic === 'true') query.isOrganic = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  if (rating) query['rating.average'] = { $gte: parseFloat(rating) };
  if (search) {
    query.$text = { $search: search };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { 'rating.average': -1 };
  else if (sort === 'popular') sortOption = { totalSold: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('farmerId', 'farmName slug location rating')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: products
  });
});

// @desc    Get nearby products
// @route   GET /api/v1/products/nearby
exports.getNearbyProducts = asyncHandler(async (req, res) => {
  const { lng, lat, radius = 10 } = req.query;

  if (!lng || !lat) {
    return res.status(400).json({ success: false, message: 'Please provide longitude and latitude' });
  }

  // Find nearby farmers first
  const nearbyFarmers = await Farmer.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
      }
    },
    isApproved: 'approved',
    isActive: true
  }).select('_id');

  const farmerIds = nearbyFarmers.map(f => f._id);

  const { page, limit, skip } = getPagination(req.query);
  const total = await Product.countDocuments({ farmerId: { $in: farmerIds }, isAvailable: true });
  const products = await Product.find({ farmerId: { $in: farmerIds }, isAvailable: true })
    .populate('farmerId', 'farmName slug location rating')
    .sort({ 'rating.average': -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: 'farmerId',
      select: 'farmName slug location rating description specialties coverImage operatingHours deliveryRadius',
      populate: { path: 'userId', select: 'name avatar phone' }
    });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Track recently viewed if user is authenticated
  if (req.user) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { recentlyViewed: { product: product._id } }
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        recentlyViewed: {
          $each: [{ product: product._id, viewedAt: new Date() }],
          $position: 0,
          $slice: 20
        }
      }
    });
  }

  res.json({ success: true, data: product });
});

// @desc    Create product (farmer only)
// @route   POST /api/v1/products
exports.createProduct = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user.id });
  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Farmer profile not found' });
  }

  if (farmer.isApproved !== 'approved') {
    return res.status(403).json({ success: false, message: 'Your farm must be approved before adding products' });
  }

  req.body.farmerId = farmer._id;

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const images = await uploadMultiple(req.files, 'farm2door/products');
    req.body.images = images;
  }

  const product = await Product.create(req.body);

  // Update farmer's product count
  await Farmer.findByIdAndUpdate(farmer._id, { $inc: { totalProducts: 1 } });

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product (farmer only)
// @route   PUT /api/v1/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user.id });
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (product.farmerId.toString() !== farmer._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImages = await uploadMultiple(req.files, 'farm2door/products');
    req.body.images = [...(product.images || []), ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: product });
});

// @desc    Delete product (farmer only)
// @route   DELETE /api/v1/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user.id });
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (product.farmerId.toString() !== farmer._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
  }

  await product.deleteOne();
  await Farmer.findByIdAndUpdate(farmer._id, { $inc: { totalProducts: -1 } });

  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isAvailable: true })
    .populate('farmerId', 'farmName slug rating')
    .sort({ 'rating.average': -1 })
    .limit(12);

  res.json({ success: true, data: products });
});

// @desc    Get product categories with counts
// @route   GET /api/v1/products/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isAvailable: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
    { $sort: { count: -1 } }
  ]);

  res.json({ success: true, data: categories });
});
