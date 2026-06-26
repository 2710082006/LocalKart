const { getRazorpay } = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Address = require('../models/Address');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { asyncHandler, generateInvoiceNumber } = require('../utils/helpers');
const crypto = require('crypto');

// @desc    Create Razorpay order (NO database order created yet)
// @route   POST /api/v1/payments/create-order
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, farmerId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid amount is required' });
  }

  // Validate farmer exists
  if (farmerId) {
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }
  }

  const receiptId = `rcpt_${Date.now().toString(36)}`;

  try {
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        customerId: req.user.id,
        farmerId: farmerId || ''
      }
    });

    // Save a pending payment record (no orderId yet — order doesn't exist)
    const payment = await Payment.create({
      userId: req.user.id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      method: 'razorpay',
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    // Mock response for development (when Razorpay keys are not configured)
    const mockOrderId = `order_mock_${Date.now()}`;
    const payment = await Payment.create({
      userId: req.user.id,
      razorpayOrderId: mockOrderId,
      amount,
      method: 'razorpay',
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId: mockOrderId,
        amount: amount * 100,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
        mock: true
      }
    });
  }
});

// @desc    Verify payment AND create order (only after successful verification)
// @route   POST /api/v1/payments/verify
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    // Order data — sent along with payment verification
    orderData
  } = req.body;

  // --- 1. Find the pending payment record ---
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }

  // Ensure this payment belongs to the requesting user
  if (payment.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // --- GUARD: Prevent duplicate processing (replay attacks / double-clicks) ---
  if (payment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This payment has already been processed'
    });
  }

  // --- 2. Verify Razorpay signature (skip for mock/dev orders) ---
  if (!razorpay_order_id.includes('mock')) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed — signature mismatch' });
    }
  }

  // --- 3. Signature verified — now create the order ---
  if (!orderData) {
    return res.status(400).json({ success: false, message: 'Order data is required for order creation' });
  }

  const { farmerId, items, deliveryAddress, deliverySlot, notes } = orderData;

  // Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    payment.status = 'failed';
    await payment.save();
    return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
  }

  // Validate each item has a valid quantity
  for (const item of items) {
    if (!item.product || !item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity)) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Each item must have a valid product ID and positive integer quantity' });
    }
  }

  // Validate farmer
  const farmer = await Farmer.findById(farmerId);
  if (!farmer) {
    payment.status = 'failed';
    await payment.save();
    return res.status(404).json({ success: false, message: 'Farmer not found' });
  }

  // Get address
  const address = await Address.findById(deliveryAddress);
  if (!address) {
    payment.status = 'failed';
    await payment.save();
    return res.status(404).json({ success: false, message: 'Delivery address not found' });
  }

  // Calculate totals and validate stock
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      payment.status = 'failed';
      await payment.save();
      return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
    }
    if (product.stock < item.quantity) {
      payment.status = 'failed';
      await payment.save();
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
  }

  const deliveryFee = subtotal >= (farmer.minimumOrder ?? 200) ? 0 : 30;
  const totalAmount = subtotal + deliveryFee;

  if (totalAmount !== payment.amount) {
    payment.status = 'failed';
    await payment.save();
    return res.status(400).json({ success: false, message: 'Payment amount mismatch. Potential fraud detected.' });
  }

  // Deduct stock atomically before creating order
  const deductedProducts = [];
  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, totalSold: item.quantity } }
    );
    if (!updated) {
      // Rollback
      for (const d of deductedProducts) {
        await Product.findByIdAndUpdate(d.product, {
          $inc: { stock: d.quantity, totalSold: -d.quantity }
        });
      }
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: `Stock exhausted for product ${item.name} during checkout.` });
    }
    deductedProducts.push(item);
  }

  // Create the order
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
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',  // Already verified
    paymentId: payment._id,
    notes,
    timeline: [{ status: 'placed', message: 'Order placed successfully (payment verified)', timestamp: new Date() }],
    invoice: { number: generateInvoiceNumber() },
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  });

  // Clear user cart
  await User.findByIdAndUpdate(req.user.id, { cart: [] });

  // --- 4. Update payment record with order reference ---
  payment.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
  payment.razorpaySignature = razorpay_signature || 'mock_signature';
  payment.status = 'completed';
  payment.orderId = order._id;
  await payment.save();

  // --- 5. Update farmer stats ---
  await Farmer.findByIdAndUpdate(farmerId, {
    $inc: { totalOrders: 1, totalRevenue: totalAmount }
  });

  // --- 6. Create notifications ---
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

  res.json({
    success: true,
    message: 'Payment verified and order created successfully',
    data: { payment, order }
  });
});

// @desc    Get payment history
// @route   GET /api/v1/payments/history
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id })
    .populate('orderId', 'orderNumber totalAmount status')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: payments });
});

// @desc    Razorpay webhook handler (safety net for dropped connections)
// @route   POST /api/v1/payments/webhook
// @access  Public (verified via Razorpay signature)
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // If webhook secret is not configured, acknowledge but do nothing
    if (!webhookSecret) {
      console.log('[Webhook] RAZORPAY_WEBHOOK_SECRET not configured, skipping verification');
      return res.status(200).json({ status: 'ok' });
    }

    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const expectedSignature = shasum.digest('hex');

    const receivedSignature = req.headers['x-razorpay-signature'];

    if (expectedSignature !== receivedSignature) {
      console.log('[Webhook] Invalid signature');
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const razorpayOrderId = payload?.payment?.entity?.order_id;

      if (razorpayOrderId) {
        const payment = await Payment.findOne({ razorpayOrderId });

        if (payment && payment.status === 'pending') {
          // Mark payment as completed (order was already created via /verify in most cases)
          payment.status = 'completed';
          payment.razorpayPaymentId = payload.payment.entity.id;
          await payment.save();
          console.log(`[Webhook] Payment ${razorpayOrderId} marked as completed`);
        }
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = payload?.payment?.entity?.order_id;

      if (razorpayOrderId) {
        const payment = await Payment.findOne({ razorpayOrderId });

        if (payment && payment.status === 'pending') {
          payment.status = 'failed';
          await payment.save();
          console.log(`[Webhook] Payment ${razorpayOrderId} marked as failed`);
        }
      }
    }

    // Always respond 200 to Razorpay to acknowledge receipt
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Error:', error.message);
    // Still respond 200 to prevent Razorpay from retrying
    res.status(200).json({ status: 'error_handled' });
  }
};
