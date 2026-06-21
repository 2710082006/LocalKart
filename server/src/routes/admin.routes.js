const express = require('express');
const router = express.Router();
const {
  getDashboard, getUsers, toggleUserStatus, getPendingFarmers,
  approveFarmer, getComplaints, resolveComplaint, toggleFeatured, getAnalytics
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.put('/users/:id/suspend', toggleUserStatus);

// Farmer management
router.get('/farmers/pending', getPendingFarmers);
router.put('/farmers/:id/approve', approveFarmer);
router.put('/farmers/:id/feature', toggleFeatured);

// Complaint management
router.get('/complaints', getComplaints);
router.put('/complaints/:id/resolve', resolveComplaint);

module.exports = router;
