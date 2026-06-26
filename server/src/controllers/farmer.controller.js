const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { asyncHandler, getPagination } = require('../utils/helpers');
const axios = require('axios');

// @desc    Get nearby farmers
// @route   GET /api/v1/farmers/nearby
exports.getNearbyFarmers = asyncHandler(async (req, res) => {
  const { lng, lat, radius = 10 } = req.query;

  if (!lng || !lat) {
    return res.status(400).json({ success: false, message: 'Please provide longitude and latitude' });
  }

  const farmers = await Farmer.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius) * 1000
      }
    },
    isApproved: 'approved',
    isActive: true
  })
    .populate('userId', 'name avatar phone')
    .limit(20);

  res.json({ success: true, count: farmers.length, data: farmers });
});

// @desc    Get all farmers
// @route   GET /api/v1/farmers
exports.getFarmers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const query = {
    isApproved: "approved",
    isActive: true,
  };

  // Search by farm name OR city
  if (req.query.search) {
    query.$or = [
      { farmName: { $regex: req.query.search, $options: "i" } },
      { "location.city": { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Featured filter
  if (req.query.featured === "true") {
    query.isFeatured = true;
  }

  // Nearby filter (uses customer location)
  if (req.query.lng && req.query.lat) {
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [
            Number(req.query.lng),
            Number(req.query.lat),
          ],
        },
        $maxDistance: 10000, // 10km radius
      },
    };
  }

  // Count total matching documents
  // Note: $near can't be used with countDocuments, so we use a separate count query
  // with $geoWithin (which supports countDocuments) for an accurate count
  let total;
  if (query.location) {
    const countQuery = { ...query };
    countQuery.location = {
      $geoWithin: {
        $centerSphere: [
          [Number(req.query.lng), Number(req.query.lat)],
          10 / 6378.1 // 10km radius in radians (Earth radius = 6378.1 km)
        ]
      }
    };
    total = await Farmer.countDocuments(countQuery);
  } else {
    total = await Farmer.countDocuments(query);
  }

  const farmers = await Farmer.find(query)
    .populate("userId", "name avatar phone")
    .sort({ "rating.average": -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: farmers.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: farmers,
  });
});
// @desc    Get farmer profile
// @route   GET /api/v1/farmers/:id
exports.getFarmer = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id)
    .populate('userId', 'name avatar phone email');

  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Farmer not found' });
  }

  const products = await Product.find({ farmerId: farmer._id, isAvailable: true })
    .sort({ 'rating.average': -1 })
    .limit(12);

  res.json({ success: true, data: { farmer, products } });
});

// @desc    Get farmer products
// @route   GET /api/v1/farmers/:id/products
exports.getFarmerProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const total = await Product.countDocuments({ farmerId: req.params.id });
  const products = await Product.find({ farmerId: req.params.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    data: products
  });
});

// @desc    Update farmer profile
// @route   PUT /api/v1/farmers/profile
exports.updateFarmerProfile = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user.id });

  if (!farmer) {
    return res.status(404).json({
      success: false,
      message: "Farmer profile not found",
    });
  }

  const allowedFields = [
    "farmName",
    "description",
    "specialties",
    "coverImage",
    "certifications",
    "paymentDetails", // FIXED (was bankDetails)
    "operatingHours",
    "deliveryRadius",
    "minimumOrder",
    "kycDocuments",
    "phone",
  ];

  // Update normal fields
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      farmer[field] = req.body[field];
    }
  });

  // Handle location separately
  if (
    req.body.location &&
    req.body.location.address &&
    req.body.location.city &&
    req.body.location.state &&
    req.body.location.pincode
  ) {
    const { address, city, state, pincode } = req.body.location;

    const fullAddress = `${address}, ${city}, ${state}, ${pincode}`;

    const geoRes = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: fullAddress,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    console.log("GOOGLE RESPONSE:", geoRes.data);

    if (geoRes.data.results.length > 0) {
      const { lat, lng } = geoRes.data.results[0].geometry.location;

      farmer.location = {
        type: "Point",
        coordinates: [lng, lat],
        address,
        city,
        state,
        pincode,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid address. Could not fetch coordinates.",
      });
    }
  }

  console.log("LOCATION BEFORE SAVE:", req.body.location);
  console.log("FARMER LOCATION BEFORE SAVE:", farmer.location);


  await farmer.save();

  res.status(200).json({
    success: true,
    message: "Farmer profile updated successfully",
    data: farmer,
  });
});
// @desc    Get farmer dashboard stats
// @route   GET /api/v1/farmers/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  console.log("REQ USER:", req.user);

  const farmer = await Farmer.findOne({ userId: req.user.id });

  console.log("FOUND FARMER:", farmer);


  if (!farmer) {
    return res.status(404).json({
      success: false,
      message: 'Farmer profile not found'
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const [
    totalOrders,
    pendingOrders,
    todayOrders,
    monthlyRevenue,
    totalProducts,
    lowStockProducts,
    recentOrders
  ] = await Promise.all([
    Order.countDocuments({ farmerId: farmer._id }),

    Order.countDocuments({
      farmerId: farmer._id,
      status: { $in: ['placed', 'confirmed'] }
    }),

    Order.countDocuments({
      farmerId: farmer._id,
      createdAt: { $gte: today }
    }),

    Order.aggregate([
      {
        $match: {
          farmerId: farmer._id,
          createdAt: { $gte: thisMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),

    Product.countDocuments({ farmerId: farmer._id }),

    Product.countDocuments({
      farmerId: farmer._id,
      stock: { $lte: 5, $gt: 0 }
    }),

    Order.find({ farmerId: farmer._id })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  // Top products
  const topProducts = await Product.find({
    farmerId: farmer._id
  })
    .sort({ totalSold: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      // Farmer profile data
      ...farmer.toObject(),

      // Dashboard stats
      totalOrders,
      pendingOrders,
      todayOrders,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: farmer.totalRevenue || 0,
      totalProducts,
      lowStockProducts,
      rating: farmer.rating,
      recentOrders,
      topProducts,
      isApproved: farmer.isApproved
    }
  });
});
// @desc    Get farmer analytics
// @route   GET /api/v1/farmers/analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user.id });
  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Farmer profile not found' });
  }

  const { period = '7d' } = req.query;
  let startDate = new Date();
  if (period === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
  else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
  else startDate.setFullYear(startDate.getFullYear() - 1);

  // Daily sales
  const dailySales = await Order.aggregate([
    {
      $match: {
        farmerId: farmer._id,
        createdAt: { $gte: startDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Category breakdown
  const categoryBreakdown = await Order.aggregate([
    { $match: { farmerId: farmer._id, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $group: {
        _id: '$productInfo.category',
        count: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  // Transactions
  const transactions = await Transaction.find({ farmerId: farmer._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: {
      dailySales,
      categoryBreakdown,
      transactions
    }
  });
});

// @desc    Get featured farmers
// @route   GET /api/v1/farmers/featured
exports.getFeaturedFarmers = asyncHandler(async (req, res) => {
  const farmers = await Farmer.find({ isFeatured: true, isApproved: 'approved', isActive: true })
    .populate('userId', 'name avatar')
    .sort({ 'rating.average': -1 })
    .limit(8);

  res.json({ success: true, data: farmers });
});

exports.updatePaymentDetails = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user.id });

  if (!farmer) {
    return res.status(404).json({
      success: false,
      message: "Farmer not found"
    });
  }

  const {
    upiId,
    bankName,
    accountHolder,
    accountNumber,
    ifscCode
  } = req.body;

  farmer.paymentDetails = {
    upiId,
    bankName,
    accountHolder,
    accountNumber,
    ifscCode
  };

  await farmer.save();

  res.status(200).json({
    success: true,
    message: "Payment details updated successfully",
    bankDetails: farmer.bankDetails
  });
});