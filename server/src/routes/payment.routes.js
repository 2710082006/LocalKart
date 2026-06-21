const express = require('express');
const router = express.Router();
const {
  createPaymentOrder, verifyPayment, getPaymentHistory
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
