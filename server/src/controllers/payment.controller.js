const { getRazorpay } = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { asyncHandler } = require('../utils/helpers');
const crypto = require('crypto');

// @desc    Create Razorpay order
// @route   POST /api/v1/payments/create-order
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  try {
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerId: req.user.id
      }
    });

    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user.id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      method: 'razorpay',
      status: 'pending'
    });

    order.paymentId = payment._id;
    await order.save();

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    // Mock response for development
    const mockOrderId = `order_mock_${Date.now()}`;
    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user.id,
      razorpayOrderId: mockOrderId,
      amount: order.totalAmount,
      method: 'razorpay',
      status: 'pending'
    });

    order.paymentId = payment._id;
    await order.save();

    res.json({
      success: true,
      data: {
        orderId: mockOrderId,
        amount: order.totalAmount * 100,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
        mock: true
      }
    });
  }
});

// @desc    Verify payment
// @route   POST /api/v1/payments/verify
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }

  // Verify signature (skip in mock mode)
  if (!razorpay_order_id.includes('mock')) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  }

  payment.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
  payment.razorpaySignature = razorpay_signature || 'mock_signature';
  payment.status = 'completed';
  await payment.save();

  // Update order payment status
  await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'paid' });

  res.json({ success: true, message: 'Payment verified successfully', data: payment });
});

// @desc    Get payment history
// @route   GET /api/v1/payments/history
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id })
    .populate('orderId', 'orderNumber totalAmount status')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: payments });
});
