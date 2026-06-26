const express = require('express');
const router = express.Router();

const {
  getFarmers,
  getFarmer,
  getNearbyFarmers,
  getFeaturedFarmers,
  getFarmerProducts,
  updateFarmerProfile,
  getDashboard,
  getAnalytics,
  updatePaymentDetails
} = require('../controllers/farmer.controller');

const { protect, authorize, optionalAuth, forbidRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');


// =============================
// Protected farmer routes
// =============================

// Update farmer profile
router.put(
  '/profile',
  protect,
  authorize('farmer'),
  validate(schemas.farmerProfile),
  updateFarmerProfile
);

// Update payment details
router.put(
  '/payment-details',
  protect,
  authorize('farmer'),
  updatePaymentDetails
);

// Farmer dashboard
router.get(
  '/me/dashboard',
  protect,
  authorize('farmer'),
  getDashboard
);

// Farmer analytics
router.get(
  '/me/analytics',
  protect,
  authorize('farmer'),
  getAnalytics
);


// =============================
// Public routes
// =============================

// Nearby farmers
router.get('/nearby', optionalAuth, forbidRole('farmer'), getNearbyFarmers);

// Featured farmers
router.get('/featured', optionalAuth, forbidRole('farmer'), getFeaturedFarmers);

// Get all farmers
router.get('/', optionalAuth, forbidRole('farmer'), getFarmers);

// IMPORTANT: specific route before generic route
router.get('/:id/products', optionalAuth, forbidRole('farmer'), getFarmerProducts);

// Get single farmer (keep LAST)
router.get('/:id', optionalAuth, forbidRole('farmer'), getFarmer);

module.exports = router;