const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Address = require('../models/Address');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { asyncHandler, getPagination, generateInvoiceNumber } = require('../utils/helpers');

// @desc    Create order
// @route   POST /api/v1/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { farmerId, items, deliveryAddress, paymentMethod, deliverySlot, notes } = req.body;

  // Validate farmer
  const farmer = await Farmer.findById(farmerId);
  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Farmer not found' });
  }

  // Get address
  const address = await Address.findById(deliveryAddress);
  if (!address) {
    return res.status(404).json({ success: false, message: 'Delivery address not found' });
  }

  // Calculate totals and validate stock
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      unit: product.unit
    });

    // Reduce stock
    product.stock -= item.quantity;
    product.totalSold += item.quantity;
    await product.save();
  }

  const deliveryFee = subtotal >= (farmer.minimumOrder || 200) ? 0 : 30;
  const totalAmount = subtotal + deliveryFee;

  const order = await Order.create({
    customerId: req.user.id,
    farmerId,
    items: orderItems,
    subtotal,
    deliveryFee,
    totalAmount,
    status: 'placed',
    deliveryAddress: {
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      location: address.location,
      phone: address.phone
    },
    deliverySlot,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    notes,
    timeline: [{ status: 'placed', message: 'Order placed successfully', timestamp: new Date() }],
    invoice: { number: generateInvoiceNumber() },
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  });

  // Update farmer stats
  await Farmer.findByIdAndUpdate(farmerId, {
    $inc: { totalOrders: 1, totalRevenue: totalAmount }
  });

  // Create notifications
  await Notification.create([
    {
      userId: req.user.id,
      type: 'order',
      title: 'Order Placed',
      message: `Your order #${order.orderNumber} has been placed successfully!`,
      data: { orderId: order._id }
    },
    {
      userId: farmer.userId,
      type: 'order',
      title: 'New Order Received',
      message: `You have received a new order #${order.orderNumber}`,
      data: { orderId: order._id }
    }
  ]);

  res.status(201).json({ success: true, data: order });
});

// @desc    Get user orders
// @route   GET /api/v1/orders
exports.getOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  let query = {};

  if (req.user.role === 'customer') {
    query.customerId = req.user.id;
  } else if (req.user.role === 'farmer') {
    const farmer = await Farmer.findOne({ userId: req.user.id });
    query.farmerId = farmer._id;
  }

  if (status) query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('customerId', 'name email phone avatar')
    .populate({
      path: 'farmerId',
      select: 'farmName slug',
      populate: { path: 'userId', select: 'name phone' }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customerId', 'name email phone avatar')
    .populate({
      path: 'farmerId',
      select: 'farmName slug location',
      populate: { path: 'userId', select: 'name phone' }
    })
    .populate('deliveryAgentId');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const validTransitions = {
    placed: ['confirmed', 'cancelled'],
    confirmed: ['packed', 'cancelled'],
    packed: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot transition from '${order.status}' to '${status}'`
    });
  }

  order.status = status;
  order.timeline.push({
    status,
    message: message || `Order ${status.replace(/_/g, ' ')}`,
    timestamp: new Date(),
    updatedBy: req.user.id
  });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'paid';

    // Create transaction for farmer
    await Transaction.create({
      farmerId: order.farmerId,
      orderId: order._id,
      amount: order.totalAmount * 0.9, // 10% platform commission
      type: 'credit',
      description: `Payment for order #${order.orderNumber}`,
      status: 'completed'
    });
  }

  if (status === 'cancelled') {
    order.cancellationReason = message || 'Order cancelled';
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSold: -item.quantity }
      });
    }
  }

  await order.save();

  // Notify customer
  await Notification.create({
    userId: order.customerId,
    type: 'order',
    title: `Order ${status.replace(/_/g, ' ')}`,
    message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}`,
    data: { orderId: order._id }
  });

  res.json({ success: true, data: order });
});

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!['placed', 'confirmed'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
  }

  if (order.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
  }

  order.status = 'cancelled';
  order.cancellationReason = req.body.reason || 'Cancelled by customer';
  order.timeline.push({
    status: 'cancelled',
    message: req.body.reason || 'Order cancelled by customer',
    timestamp: new Date(),
    updatedBy: req.user.id
  });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, totalSold: -item.quantity }
    });
  }

  await order.save();

  res.json({ success: true, data: order });
});
