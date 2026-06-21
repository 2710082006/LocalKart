const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const { asyncHandler, getPagination } = require('../utils/helpers');

// @desc    Get admin dashboard
// @route   GET /api/v1/admin/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalUsers,
    totalFarmers,
    totalProducts,
    totalOrders,
    pendingFarmers,
    openComplaints,
    gmv,
    monthlyGMV,
    todayOrders,
    recentOrders
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Farmer.countDocuments({ isApproved: 'approved' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Farmer.countDocuments({ isApproved: 'pending' }),
    Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thisMonth }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.find()
      .populate('customerId', 'name email')
      .populate('farmerId', 'farmName')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  // Monthly trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrend = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalFarmers,
      totalProducts,
      totalOrders,
      pendingFarmers,
      openComplaints,
      totalGMV: gmv[0]?.total || 0,
      monthlyGMV: monthlyGMV[0]?.total || 0,
      todayOrders,
      recentOrders,
      monthlyTrend
    }
  });
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, search } = req.query;

  let query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ success: true, count: users.length, total, pages: Math.ceil(total / limit), data: users });
});

// @desc    Suspend/activate user
// @route   PUT /api/v1/admin/users/:id/suspend
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.isActive = !user.isActive;
  await user.save();

  await Notification.create({
    userId: user._id,
    type: 'system',
    title: user.isActive ? 'Account Reactivated' : 'Account Suspended',
    message: user.isActive ? 'Your account has been reactivated' : 'Your account has been suspended'
  });

  res.json({ success: true, data: user });
});

// @desc    Get pending farmer approvals
// @route   GET /api/v1/admin/farmers/pending
exports.getPendingFarmers = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find({ isApproved: 'pending' })
    .populate('userId', 'name email phone avatar createdAt')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: farmers.length, data: farmers });
});

// @desc    Approve/reject farmer
// @route   PUT /api/v1/admin/farmers/:id/approve
exports.approveFarmer = asyncHandler(async (req, res) => {
  const { status, reason } = req.body; // status: 'approved' or 'rejected'

  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Farmer not found' });
  }

  farmer.isApproved = status;
  await farmer.save();

  await Notification.create({
    userId: farmer.userId,
    type: 'approval',
    title: status === 'approved' ? 'Farm Approved!' : 'Farm Application Rejected',
    message: status === 'approved'
      ? 'Congratulations! Your farm has been approved. You can now start selling!'
      : `Your farm application was rejected. Reason: ${reason || 'Not specified'}`
  });

  res.json({ success: true, data: farmer });
});

// @desc    Get complaints
// @route   GET /api/v1/admin/complaints
exports.getComplaints = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  let query = {};
  if (status) query.status = status;

  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate('userId', 'name email')
    .populate('orderId', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ success: true, count: complaints.length, total, pages: Math.ceil(total / limit), data: complaints });
});

// @desc    Resolve complaint
// @route   PUT /api/v1/admin/complaints/:id/resolve
exports.resolveComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.status = req.body.status || 'resolved';
  complaint.resolution = {
    text: req.body.resolution,
    resolvedBy: req.user.id,
    resolvedAt: new Date()
  };
  await complaint.save();

  await Notification.create({
    userId: complaint.userId,
    type: 'system',
    title: 'Complaint Updated',
    message: `Your complaint "${complaint.subject}" has been ${complaint.status}`
  });

  res.json({ success: true, data: complaint });
});

// @desc    Toggle featured farmer
// @route   PUT /api/v1/admin/farmers/:id/feature
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Farmer not found' });
  }

  farmer.isFeatured = !farmer.isFeatured;
  await farmer.save();

  res.json({ success: true, data: farmer });
});

// @desc    Admin analytics
// @route   GET /api/v1/admin/analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dailyOrders, categoryDistribution, topFarmers, userGrowth] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Farmer.find({ isApproved: 'approved' })
      .populate('userId', 'name avatar')
      .sort({ totalRevenue: -1 })
      .limit(10),
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: { dailyOrders, categoryDistribution, topFarmers, userGrowth }
  });
});
