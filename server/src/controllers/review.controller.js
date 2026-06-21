const Review = require('../models/Review');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Order = require('../models/Order');
const { asyncHandler, getPagination } = require('../utils/helpers');

// @desc    Create review
// @route   POST /api/v1/reviews
exports.createReview = asyncHandler(async (req, res) => {
  const { productId, farmerId, orderId, rating, title, comment } = req.body;

  if (!productId && !farmerId) {
    return res.status(400).json({ success: false, message: 'Please provide productId or farmerId' });
  }

  // Check for verified purchase
  let isVerifiedPurchase = false;
  if (orderId) {
    const order = await Order.findOne({
      _id: orderId,
      customerId: req.user.id,
      status: 'delivered'
    });
    if (order) isVerifiedPurchase = true;
  }

  // Check for duplicate
  const existingReview = await Review.findOne({
    userId: req.user.id,
    ...(productId && { productId }),
    ...(farmerId && { farmerId })
  });

  if (existingReview) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
  }

  // Handle image uploads
  let images = [];
  if (req.files && req.files.length > 0) {
    const { uploadMultiple } = require('../utils/helpers');
    images = await uploadMultiple(req.files, 'farm2door/reviews');
  }

  const review = await Review.create({
    userId: req.user.id,
    productId,
    farmerId,
    orderId,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase
  });

  await review.populate('userId', 'name avatar');

  res.status(201).json({ success: true, data: review });
});

// @desc    Get product reviews
// @route   GET /api/v1/reviews/product/:productId
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { sort } = req.query;

  let sortOption = { createdAt: -1 };
  if (sort === 'rating_high') sortOption = { rating: -1 };
  else if (sort === 'rating_low') sortOption = { rating: 1 };
  else if (sort === 'helpful') sortOption = { helpfulCount: -1 };

  const query = { productId: req.params.productId };
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('userId', 'name avatar')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { productId: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  res.json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    distribution,
    data: reviews
  });
});

// @desc    Get farmer reviews
// @route   GET /api/v1/reviews/farmer/:farmerId
exports.getFarmerReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const query = { farmerId: req.params.farmerId };
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: reviews
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
exports.updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  if (review.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
  }

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;

  await review.save();
  await review.populate('userId', 'name avatar');

  res.json({ success: true, data: review });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
  }

  const { productId, farmerId } = review;
  await review.deleteOne();

  // Recalculate ratings
  if (productId) await Review.calcAverageRating(productId);
  if (farmerId) await Review.calcFarmerRating(farmerId);

  res.json({ success: true, message: 'Review deleted' });
});

// @desc    Mark review as helpful
// @route   PUT /api/v1/reviews/:id/helpful
exports.markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulCount: 1 } },
    { new: true }
  );

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  res.json({ success: true, data: review });
});

// @desc    Add farmer response to review
// @route   PUT /api/v1/reviews/:id/respond
exports.respondToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  // Verify farmer owns the product/farm being reviewed
  const farmer = await Farmer.findOne({ userId: req.user.id });
  if (!farmer) {
    return res.status(403).json({ success: false, message: 'Only farmers can respond to reviews' });
  }

  review.response = {
    text: req.body.text,
    respondedAt: new Date()
  };
  await review.save();

  res.json({ success: true, data: review });
});

// @desc    Get user's own reviews
// @route   GET /api/v1/reviews/my-reviews
exports.getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const query = { userId: req.user.id };
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('productId', 'name images price')
    .populate('farmerId', 'farmName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: reviews
  });
});
