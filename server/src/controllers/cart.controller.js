const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/helpers');

// @desc    Get cart
// @route   GET /api/v1/cart
exports.getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'cart.product',
    select: 'name price originalPrice unit images stock isAvailable farmerId',
    populate: { path: 'farmerId', select: 'farmName slug deliveryRadius minimumOrder' }
  });

  // Calculate totals
  let subtotal = 0;
  const validItems = [];

  for (const item of user.cart) {
    if (item.product && item.product.isAvailable && item.product.stock > 0) {
      const qty = Math.min(item.quantity, item.product.stock);
      subtotal += item.product.price * qty;
      validItems.push({
        product: item.product,
        quantity: qty
      });
    }
  }

  res.json({
    success: true,
    data: {
      items: validItems,
      count: validItems.length,
      subtotal,
      deliveryFee: subtotal >= 200 ? 0 : 30,
      total: subtotal + (subtotal >= 200 ? 0 : 30)
    }
  });
});

// @desc    Add to cart
// @route   POST /api/v1/cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const quantity = parseInt(req.body.quantity || 1, 10);

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (!product.isAvailable || product.stock < 1) {
    return res.status(400).json({ success: false, message: 'Product is not available' });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
  }

  const user = await User.findById(req.user.id);

  const existingIndex = user.cart.findIndex(
    item => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    const newQty = user.cart[existingIndex].quantity + quantity;
    if (newQty > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
    }
    user.cart[existingIndex].quantity = newQty;
  } else {
    user.cart.push({ product: productId, quantity });
  }

  await user.save();

  res.json({ success: true, message: 'Added to cart', count: user.cart.length });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:productId
exports.updateCartItem = asyncHandler(async (req, res) => {
  const quantity = parseInt(req.body.quantity, 10);

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  const product = await Product.findById(req.params.productId);
  if (product && quantity > product.stock) {
    return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
  }

  const user = await User.findById(req.user.id);

  const itemIndex = user.cart.findIndex(
    item => item.product.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found in cart' });
  }

  user.cart[itemIndex].quantity = quantity;
  await user.save();

  res.json({ success: true, message: 'Cart updated' });
});

// @desc    Remove from cart
// @route   DELETE /api/v1/cart/:productId
exports.removeFromCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.cart = user.cart.filter(
    item => item.product.toString() !== req.params.productId
  );
  await user.save();

  res.json({ success: true, message: 'Removed from cart', count: user.cart.length });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
exports.clearCart = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { cart: [] });
  res.json({ success: true, message: 'Cart cleared' });
});
