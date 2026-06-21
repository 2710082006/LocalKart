const express = require('express');
const router = express.Router();
const {
  getNotifications, markAsRead, markAllAsRead,
  deleteNotification, clearNotifications, getUnreadCount
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect); // All notification routes require authentication

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.delete('/clear', clearNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
