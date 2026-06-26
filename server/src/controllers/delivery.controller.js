const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { asyncHandler, getPagination } = require('../utils/helpers');
const axios = require('axios');

// @desc    Get delivery agent dashboard
// @route   GET /api/v1/delivery/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeAssignments, todayDeliveries, totalDelivered] = await Promise.all([
    Order.find({
      deliveryAgentId: agent._id,
      status: { $in: ['placed', 'confirmed', 'packed', 'out_for_delivery'] }
    })
      .populate('customerId', 'name phone')
      .populate('farmerId', 'farmName location')
      .sort({ createdAt: -1 }),
    Order.countDocuments({
      deliveryAgentId: agent._id,
      deliveredAt: { $gte: today }
    }),
    Order.countDocuments({
      deliveryAgentId: agent._id,
      status: 'delivered'
    })
  ]);

  res.json({
    success: true,
    data: {
      agent: agent.toObject(),
      activeAssignments,
      todayDeliveries,
      totalDelivered
    }
  });
});

// @desc    Get assigned orders
// @route   GET /api/v1/delivery/assignments
exports.getAssignments = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  let query = { deliveryAgentId: agent._id };
  if (status) {
    query.status = status;
  } else {
    query.status = { $in: ['placed', 'confirmed', 'packed', 'out_for_delivery'] };
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('customerId', 'name phone avatar')
    .populate({
      path: 'farmerId',
      select: 'farmName location',
      populate: { path: 'userId', select: 'name phone' }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: orders
  });
});

// @desc    Get delivery history
// @route   GET /api/v1/delivery/history
exports.getDeliveryHistory = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  const { page, limit, skip } = getPagination(req.query);

  const query = { deliveryAgentId: agent._id, status: { $in: ['delivered', 'cancelled'] } };
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('customerId', 'name')
    .populate('farmerId', 'farmName')
    .sort({ deliveredAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: orders
  });
});

// @desc    Update delivery status (pickup / out_for_delivery / delivered)
// @route   PUT /api/v1/delivery/orders/:id/status
exports.updateDeliveryStatus = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!order.deliveryAgentId || order.deliveryAgentId.toString() !== agent._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not assigned to this delivery' });
  }

  const { status, message } = req.body;

  const validTransitions = {
    packed: ['out_for_delivery'],
    out_for_delivery: ['delivered']
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot transition from '${order.status}' to '${status}'`
    });
  }

  order.status = status;
  order.timeline.push({
    status,
    message: message || `Order ${status.replace(/_/g, ' ')}`,
    timestamp: new Date(),
    updatedBy: req.user.id
  });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;

    // Update agent stats
    agent.completedDeliveries += 1;
    agent.totalEarnings += 30; // Delivery fee per order
    agent.assignedOrders = agent.assignedOrders.filter(
      id => id.toString() !== order._id.toString()
    );
    await agent.save();
  }

  await order.save();

  // Notify customer
  await Notification.create({
    userId: order.customerId,
    type: 'delivery',
    title: status === 'delivered' ? 'Order Delivered!' : 'Order Out for Delivery',
    message: status === 'delivered'
      ? `Your order #${order.orderNumber} has been delivered!`
      : `Your order #${order.orderNumber} is out for delivery`,
    data: { orderId: order._id }
  });

  res.json({ success: true, data: order });
});

// @desc    Update agent location
// @route   PUT /api/v1/delivery/location
exports.updateLocation = asyncHandler(async (req, res) => {
  const { coordinates } = req.body; // [longitude, latitude]

  if (!coordinates || coordinates.length !== 2) {
    return res.status(400).json({ success: false, message: 'Please provide valid coordinates [lng, lat]' });
  }

  const agent = await DeliveryAgent.findOneAndUpdate(
    { userId: req.user.id },
    {
      currentLocation: {
        type: 'Point',
        coordinates
      }
    },
    { new: true }
  );

  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  res.json({ success: true, data: { coordinates: agent.currentLocation.coordinates } });
});

// @desc    Toggle availability
// @route   PUT /api/v1/delivery/availability
exports.toggleAvailability = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  agent.isAvailable = !agent.isAvailable;
  await agent.save();

  res.json({ success: true, data: { isAvailable: agent.isAvailable } });
});

// @desc    Update delivery agent profile
// @route   PUT /api/v1/delivery/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  const allowedFields = ['vehicleType', 'vehicleNumber', 'licenseNumber', 'zone', 'bankDetails', 'address'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      agent[field] = req.body[field];
    }
  });

  if (req.body.address && req.body.address.street && req.body.address.city && req.body.address.state && req.body.address.pincode) {
    const { street, city, state, pincode } = req.body.address;
    const fullAddress = `${street}, ${city}, ${state}, ${pincode}`;
    
    try {
      const geoRes = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          address: fullAddress,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (geoRes.data.results.length > 0) {
        const { lat, lng } = geoRes.data.results[0].geometry.location;
        agent.currentLocation = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }

  await agent.save();

  res.json({ success: true, data: agent });
});

// @desc    Get earnings summary
// @route   GET /api/v1/delivery/earnings
exports.getEarnings = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayCount, weekCount, monthCount] = await Promise.all([
    Order.countDocuments({ deliveryAgentId: agent._id, status: 'delivered', deliveredAt: { $gte: today } }),
    Order.countDocuments({ deliveryAgentId: agent._id, status: 'delivered', deliveredAt: { $gte: thisWeek } }),
    Order.countDocuments({ deliveryAgentId: agent._id, status: 'delivered', deliveredAt: { $gte: thisMonth } })
  ]);

  const deliveryFee = 30; // Per delivery

  res.json({
    success: true,
    data: {
      totalEarnings: agent.totalEarnings,
      todayEarnings: todayCount * deliveryFee,
      weeklyEarnings: weekCount * deliveryFee,
      monthlyEarnings: monthCount * deliveryFee,
      todayDeliveries: todayCount,
      weeklyDeliveries: weekCount,
      monthlyDeliveries: monthCount,
      completedDeliveries: agent.completedDeliveries
    }
  });
});

// @desc    Assign delivery agent to order (admin/farmer)
// @route   PUT /api/v1/delivery/assign/:orderId
exports.assignDelivery = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!['confirmed', 'packed'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order must be confirmed or packed for delivery assignment' });
  }

  let agent;
  if (agentId) {
    agent = await DeliveryAgent.findById(agentId);
  } else {
    // Auto-assign nearest available agent (with fewer than 5 assigned orders)
    agent = await DeliveryAgent.findOne({
      isAvailable: true,
      isActive: true,
      'assignedOrders.4': { $exists: false } // Array length < 5
    });

    if (!agent) {
      agent = await DeliveryAgent.findOne({ isAvailable: true, isActive: true });
    }
  }

  if (!agent) {
    return res.status(404).json({ success: false, message: 'No delivery agent available' });
  }

  order.deliveryAgentId = agent._id;
  await order.save();

  agent.assignedOrders.push(order._id);
  await agent.save();

  // Notify delivery agent
  await Notification.create({
    userId: agent.userId,
    type: 'delivery',
    title: 'New Delivery Assignment',
    message: `You have been assigned order #${order.orderNumber}`,
    data: { orderId: order._id }
  });

  res.json({ success: true, data: order });
});

// @desc    Get available orders nearby
// @route   GET /api/v1/delivery/available-orders
exports.getAvailableOrders = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  if (!agent.currentLocation || agent.currentLocation.coordinates[0] === 0) {
    return res.status(400).json({ success: false, message: 'Please update your address profile to view nearby orders' });
  }

  const { page, limit, skip } = getPagination(req.query);

  const query = {
    deliveryAgentId: null,
    status: { $in: ['placed', 'confirmed', 'packed'] },
    'deliveryAddress.location': {
      $geoWithin: {
        $centerSphere: [
          [agent.currentLocation.coordinates[0], agent.currentLocation.coordinates[1]],
          10 / 6378.1 // 10km radius in radians
        ]
      }
    }
  };

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('customerId', 'name phone avatar')
    .populate({
      path: 'farmerId',
      select: 'farmName location userId',
      populate: { path: 'userId', select: 'name phone' }
    })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: orders
  });
});

// @desc    Accept an available order
// @route   PUT /api/v1/delivery/orders/:id/accept
exports.acceptOrder = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ userId: req.user.id });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
  }

  if (!agent.isActive || !agent.isAvailable) {
    return res.status(400).json({ success: false, message: 'You must be active and available to accept orders' });
  }

  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.id,
      deliveryAgentId: null,
      status: { $in: ['placed', 'confirmed', 'packed'] },
      'deliveryAddress.location': {
        $geoWithin: {
          $centerSphere: [
            [agent.currentLocation.coordinates[0], agent.currentLocation.coordinates[1]],
            10 / 6378.1
          ]
        }
      }
    },
    { deliveryAgentId: agent._id },
    { new: true }
  );

  if (!order) {
    return res.status(400).json({ success: false, message: 'Order is no longer available or does not exist' });
  }

  agent.assignedOrders.push(order._id);
  await agent.save();

  order.timeline.push({
    status: order.status,
    message: 'Delivery agent assigned',
    timestamp: new Date(),
    updatedBy: req.user.id
  });
  await order.save();

  // Notify customer
  await Notification.create({
    userId: order.customerId,
    type: 'delivery',
    title: 'Delivery Agent Assigned',
    message: `A delivery agent has been assigned to your order #${order.orderNumber}`,
    data: { orderId: order._id }
  });

  res.json({ success: true, data: order });
});
