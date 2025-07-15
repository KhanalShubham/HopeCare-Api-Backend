const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.authorizeToken);

// Get all notifications for the logged-in user
router.get('/', notificationController.getNotifications);

// Mark a notification as read
router.post('/mark-read', notificationController.markAsRead);

// Mark all notifications as read
router.post('/mark-all-read', notificationController.markAllAsRead);

// Create a notification (optional, for admin/manual use)
router.post('/', notificationController.createNotification);

// Admin: Send notification to a user or all users
router.post('/admin/send', notificationController.adminSendNotification);

module.exports = router; 