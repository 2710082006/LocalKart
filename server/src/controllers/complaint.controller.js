const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { asyncHandler, getPagination } = require('../utils/helpers');

// @desc    Create complaint
// @route   POST /api/v1/complaints
exports.createComplaint = asyncHandler(async (req, res) => {
  req.body.userId = req.user.id;

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const { uploadMultiple } = require('../utils/helpers');
    req.body.images = await uploadMultiple(req.files, 'farm2door/complaints');
  }

  const complaint = await Complaint.create(req.body);

  // Notify admins
  const User = require('../models/User');
  const admins = await User.find({ role: 'admin' }).select('_id');
  const adminNotifications = admins.map(admin => ({
    userId: admin._id,
    type: 'system',
    title: 'New Complaint',
    message: `New complaint: "${complaint.subject}"`,
    data: { link: `/admin/complaints/${complaint._id}` }
  }));

  if (adminNotifications.length > 0) {
    await Notification.create(adminNotifications);
  }

  res.status(201).json({ success: true, data: complaint });
});

// @desc    Get user complaints
// @route   GET /api/v1/complaints
exports.getMyComplaints = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const query = { userId: req.user.id };
  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate('orderId', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: complaints.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: complaints
  });
});

// @desc    Get single complaint
// @route   GET /api/v1/complaints/:id
exports.getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('orderId', 'orderNumber status')
    .populate('resolution.resolvedBy', 'name')
    .populate('messages.sender', 'name avatar role');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Only owner or admin can view
  if (complaint.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, data: complaint });
});

// @desc    Add message to complaint
// @route   POST /api/v1/complaints/:id/messages
exports.addMessage = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (complaint.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  complaint.messages.push({
    sender: req.user.id,
    text: req.body.text,
    createdAt: new Date()
  });

  // If admin is responding, set status to in_progress
  if (req.user.role === 'admin' && complaint.status === 'open') {
    complaint.status = 'in_progress';
  }

  await complaint.save();

  // Notify the other party
  const notifyUserId = req.user.role === 'admin' ? complaint.userId : null;
  if (notifyUserId) {
    await Notification.create({
      userId: notifyUserId,
      type: 'system',
      title: 'Complaint Update',
      message: `New response on your complaint: "${complaint.subject}"`
    });
  }

  res.json({ success: true, data: complaint });
});
