const express = require('express');
const router = express.Router();
const {
  createOrder, getOrders, getOrder, updateOrderStatus, cancelOrder
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.post('/', protect, authorize('customer'), validate(schemas.createOrder), createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
