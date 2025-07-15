// services/notificationService.js

// This variable will hold the Socket.IO server instance (io)
let ioInstance;
const Notification = require('../model/Notification');

/**
 * Initializes the notification service with the Socket.IO server instance.
 * This MUST be called once when your server starts (e.g., in index.js).
 * @param {object} io - The Socket.IO server instance.
 */
const setIoInstance = (io) => {
    ioInstance = io;
};

/**
 * Sends an in-app notification to a specific user via WebSocket.
 * It uses the global `userSockets` map to find the user's active connections.
 * Also saves the notification to the database for persistence.
 * @param {string} userId - The ID of the user to send the notification to.
 * @param {object} notificationPayload - The notification content (title, body, data).
 * Example: { title: "New Update", body: "Your request was approved!", data: { type: "request_status", id: "req123" } }
 */
const sendNotificationToUser = async (userId, notificationPayload) => {
    if (!ioInstance) {
        console.error("Socket.IO instance not set in notificationService. Call setIoInstance(io) first.");
        return;
    }

    // Save notification to DB
    try {
        await Notification.create({
            userId,
            title: notificationPayload.title,
            body: notificationPayload.body,
            data: notificationPayload.data || {},
        });
    } catch (err) {
        console.error("Failed to save notification to DB:", err);
    }

    // Access the userSockets map (which is made global in socketController.js)
    // This map should contain userId -> Set<socket.id>
    const userSocketIds = global.userSockets ? global.userSockets.get(userId) : null;

    if (userSocketIds && userSocketIds.size > 0) {
        userSocketIds.forEach(socketId => {
            ioInstance.to(socketId).emit('inAppNotification', notificationPayload);
        });
        console.log(`In-app notification sent to user ${userId} on ${userSocketIds.size} active connections.`);
    } else {
        console.log(`User ${userId} not currently online/connected via WebSocket for in-app notification.`);
    }
};

module.exports = {
    setIoInstance,
    sendNotificationToUser,
};