const User = require('../model/user');
const Chat = require('../model/Chat');

const ADMIN_ID = process.env.ADMIN_ID;
const userSockets = new Map();

module.exports = (io) => {
    if (!ADMIN_ID) {
        console.error("\nFATAL ERROR: process.env.ADMIN_ID is not set. The chat system cannot function.\n");
        process.exit(1);
    }

    io.on('connection', (socket) => {
        const userId = socket.user?.id;
        const userRole = socket.user?.role;
        const username = socket.user?.name || socket.user?.email || 'Unknown User';

        if (!userId) {
            return socket.disconnect();
        }

        console.log(`SOCKET_CONTROLLER: New socket connected: ${socket.id} (User: ${username}, Role: ${userRole})`);

        // Every user joins their own private room, identified by their user ID.
        // This is used for direct messages and multi-tab syncing.
        socket.join(userId);

        // Admins also join a special, shared "adminRoom".
        if (userRole === 'admin') {
            socket.join('adminRoom');
            console.log(`SOCKET_CONTROLLER: Admin ${username} joined 'adminRoom'.`);
        }

        // --- MESSAGE EVENT HANDLER ---
        socket.on('message', async (messageData) => {
            const { to, text, fileUrl, messageType, fileName } = messageData;
            const senderId = userId;
            const senderRole = userRole;

            if (!text && !fileUrl) return;

            // Determine the receiver's ID for saving to the database
            let receiverId;
            if (senderRole === 'admin' && to) {
                receiverId = to; // Admin sending to a specific user
            } else if (senderRole === 'user') {
                receiverId = ADMIN_ID; // User is always sending to the admin
            } else {
                console.error("SOCKET_CONTROLLER: Could not determine message receiver.", { senderRole, to });
                return;
            }

            try {
                // 1. Save the message to the database
                const newMessage = new Chat({
                    sender: senderId,
                    receiver: receiverId,
                    message: text || '',
                    fileUrl: fileUrl,
                    fileName: fileName,
                    messageType: messageType || 'text',
                });
                const savedMessage = await newMessage.save();
                const populatedMessage = await Chat.findById(savedMessage._id).populate('sender', 'name email role');
                const messageToBroadcast = populatedMessage.toObject();

                console.log(`SOCKET_CONTROLLER: Message from ${senderId} to ${receiverId} saved to DB.`);

                // 2. Broadcast the message to the correct clients
                if (senderRole === 'user') {
                    // --- CRITICAL FIX ---
                    // A user's message should be sent to the shared 'adminRoom'.
                    // All connected admins will receive this.
                    io.to('adminRoom').emit('message', messageToBroadcast);
                    console.log(`SOCKET_CONTROLLER: Message from user broadcasted to 'adminRoom'.`);
                } else if (senderRole === 'admin') {
                    // An admin's message should be sent directly to the user's private room.
                    io.to(receiverId).emit('message', messageToBroadcast);
                    console.log(`SOCKET_CONTROLLER: Message from admin broadcasted to user room: ${receiverId}.`);
                }

                // 3. Echo the message back to the sender's other tabs/devices
                io.to(senderId).emit('message', messageToBroadcast);

            } catch (error) {
                console.error("SOCKET_CONTROLLER: Error saving or broadcasting message:", error);
            }
        });

        // --- DISCONNECT EVENT HANDLER ---
        socket.on('disconnect', () => {
            console.log(`SOCKET_CONTROLLER: Socket disconnected: ${socket.id}`);
        });
    });
};