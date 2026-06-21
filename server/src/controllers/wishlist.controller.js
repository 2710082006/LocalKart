const User = require('../models/User');
const { asyncHandler } = require('../utils/helpers');

// @desc    Get wishlist
// @route   GET /api/v1/wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'wishlist',
    select: 'name price originalPrice unit images rating farmerId isAvailable stock',
    populate: { path: 'farmerId', select: 'farmName slug' }
  });

  res.json({ success: true, count: user.wishlist.length, data: user.wishlist });
});

// @desc    Add to wishlist
// @route   POST /api/v1/wishlist/:productId
exports.addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.wishlist.includes(req.params.productId)) {
    return res.status(400).json({ success: false, message: 'Product already in wishlist' });
  }

  user.wishlist.push(req.params.productId);
  await user.save();

  res.json({ success: true, message: 'Added to wishlist', count: user.wishlist.length });
});

// @desc    Remove from wishlist
// @route   DELETE /api/v1/wishlist/:productId
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.wishlist = user.wishlist.filter(
    id => id.toString() !== req.params.productId
  );
  await user.save();

  res.json({ success: true, message: 'Removed from wishlist', count: user.wishlist.length });
});

// @desc    Check if product is in wishlist
// @route   GET /api/v1/wishlist/check/:productId
exports.checkWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const isInWishlist = user.wishlist.some(
    id => id.toString() === req.params.productId
  );

  res.json({ success: true, data: { isInWishlist } });
});

// @desc    Clear wishlist
// @route   DELETE /api/v1/wishlist
exports.clearWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { wishlist: [] });
  res.json({ success: true, message: 'Wishlist cleared' });
});
