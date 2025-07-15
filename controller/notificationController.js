const Notification = require('../model/Notification');
const { sendNotificationToUser } = require('../services/notificationServices');
const User = require('../model/user');

// Get all notifications for a user (sorted by newest first)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ timestamp: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.body;
    await Notification.updateOne({ _id: notificationId, userId }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read.' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
};

// Create a notification (for non-socket/manual use)
exports.createNotification = async (req, res) => {
  try {
    const userId = req.body.userId || req.user.id;
    const { title, body, data } = req.body;
    const notification = new Notification({ userId, title, body, data });
    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notification.' });
  }
};

// Admin: Send notification to a user or all users
exports.adminSendNotification = async (req, res) => {
  try {
    // Only allow admins
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only.' });
    }
    const { userId, title, body, data } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }
    if (userId) {
      // Send to one user
      await sendNotificationToUser(userId, { title, body, data });
    } else {
      // Send to all users
      const users = await User.find({ role: 'user' }, '_id');
      await Promise.all(users.map(u => sendNotificationToUser(u._id.toString(), { title, body, data })));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send notification.' });
  }
}; 