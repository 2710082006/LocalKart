const express = require('express');
const router = express.Router();
const {
  getDashboard, getAssignments, getDeliveryHistory, updateDeliveryStatus,
  updateLocation, toggleAvailability, updateProfile, getEarnings, assignDelivery
} = require('../controllers/delivery.controller');
const { protect, authorize } = require('../middleware/auth');

// Delivery agent routes
router.get('/dashboard', protect, authorize('delivery'), getDashboard);
router.get('/assignments', protect, authorize('delivery'), getAssignments);
router.get('/history', protect, authorize('delivery'), getDeliveryHistory);
router.get('/earnings', protect, authorize('delivery'), getEarnings);
router.put('/orders/:id/status', protect, authorize('delivery'), updateDeliveryStatus);
router.put('/location', protect, authorize('delivery'), updateLocation);
router.put('/availability', protect, authorize('delivery'), toggleAvailability);
router.put('/profile', protect, authorize('delivery'), updateProfile);

// Admin/farmer can assign deliveries
router.put('/assign/:orderId', protect, authorize('admin', 'farmer'), assignDelivery);

module.exports = router;
