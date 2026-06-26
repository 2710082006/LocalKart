const express = require('express');
const router = express.Router();
const {
  createPaymentOrder, verifyPayment, getPaymentHistory, handleWebhook
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-order', protect, authorize('customer'), createPaymentOrder);
router.post('/verify', protect, authorize('customer'), verifyPayment);
router.get('/history', protect, getPaymentHistory);

// Razorpay webhook (public — verified via signature, not JWT)
router.post('/webhook', handleWebhook);

module.exports = router;
