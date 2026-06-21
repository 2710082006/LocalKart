const Notification = require('../models/Notification');
const { asyncHandler, getPagination } = require('../utils/helpers');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { unread } = req.query;

  let query = { userId: req.user.id };
  if (unread === 'true') query.isRead = false;

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  if (notification.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await notification.deleteOne();

  res.json({ success: true, message: 'Notification deleted' });
});

// @desc    Delete all read notifications
// @route   DELETE /api/v1/notifications/clear
exports.clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user.id, isRead: true });
  res.json({ success: true, message: 'Read notifications cleared' });
});

// @desc    Get unread count
// @route   GET /api/v1/notifications/unread-count
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
  res.json({ success: true, data: { count } });
});
