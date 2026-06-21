const express = require('express');
const router = express.Router();
const {
  getFarmers, getFarmer, getNearbyFarmers, getFeaturedFarmers,
  getFarmerProducts, updateFarmerProfile, getDashboard, getAnalytics
} = require('../controllers/farmer.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Protected farmer-only routes (must come before /:id)
router.put('/profile', protect, authorize('farmer'), validate(schemas.farmerProfile), updateFarmerProfile);
router.get('/me/dashboard', protect, authorize('farmer'), getDashboard);
router.get('/me/analytics', protect, authorize('farmer'), getAnalytics);

// Public routes
router.get('/', getFarmers);
router.get('/nearby', getNearbyFarmers);
router.get('/featured', getFeaturedFarmers);
router.get('/:id', getFarmer);
router.get('/:id/products', getFarmerProducts);

module.exports = router;
