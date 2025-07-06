const User = require('../model/user');

// This mapping is crucial for targeting specific users
// Key: userId (string), Value: Set<socket.id> (Set of strings)
const userSockets = new Map();

// Map to track the last message timestamp for each user's conversation (for "new message" indicator)
// Key: userId (string), Value: ISO string of latest message timestamp
const lastMessageTimestamps = new Map();

module.exports = (io) => {
    // Make the connection handler async to allow database queries
    io.on('connection', async (socket) => { // <--- ADD 'async' HERE
        const userId = socket.user?.id;
        const userRole = socket.user?.role;
        let username; // Declare with let so it can be reassigned based on DB lookup

        // --- Step 1: Attempt to get username from JWT payload (preferred) ---
        username = socket.user?.username || socket.user?.name || socket.user?.email;

        // --- Step 2: If username is still not found in JWT, fetch from DB (Option 2 workaround) ---
        if (userId && !username) { // Only query DB if userId exists but no username found in JWT
            try {
                // Assuming your User model has 'username', 'name', or 'email' field for display
                const dbUser = await User.findById(userId).select('username name email').lean(); // Fetch specific fields efficiently
                if (dbUser) {
                    username = dbUser.username || dbUser.name || dbUser.email;
                    console.log(`Fetched username '${username}' from DB for user ID: ${userId}`);
                }
            } catch (error) {
                console.error(`Error fetching user data from DB for socket ${socket.id} (ID: ${userId}):`, error);
            }
        }

        // --- Step 3: Final fallback if still no username ---
        username = username || `User_${userId?.slice(-6) || 'Unknown'}`;


        console.log(`New socket connected: ${socket.id} (User: ${username}, Role: ${userRole})`);

        if (!socket.user) {
            console.log("Unauthorized socket connection attempt, disconnecting.");
            socket.disconnect();
            return;
        }

        // --- Manage userSockets map on connection ---
        if (userId) {
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);
            console.log(`User ${username} (${userId}) now has ${userSockets.get(userId).size} active connections.`);
        }

        // Join rooms based on role
        if (userRole === 'admin') {
            socket.join('adminRoom');
            console.log(`${username} (Admin) joined adminRoom`);
        } else if (userRole === 'user') {
            socket.join('userRoom');
            console.log(`${username} (User) joined userRoom`);
        }

        // --- Event: 'message' (Centralized Chat Handling) ---
        socket.on('message', (messageData) => {
            const { to, text } = messageData;

            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                console.warn(`Invalid message text received from ${username}:`, messageData);
                socket.emit('chatError', 'Message text cannot be empty.');
                return;
            }

            const senderId = userId;
            const senderRole = userRole;
            const senderName = username; // This `username` variable is correctly resolved at connection time

            // Construct the standardized message object for all receivers
            const formattedMessage = {
                from: senderName, // Display name of the sender
                text: text.trim(),
                timestamp: new Date().toISOString(),
                senderSocketId: socket.id,
                senderUserId: senderId, // The actual user ID of the sender
                senderRole: senderRole, // Include sender's role for frontend logic if needed
            };

            console.log(`Incoming message: From ${senderName} (ID: ${senderId}, Role: ${senderRole}) ${to ? `to User ID: ${to}` : 'to AdminRoom'}: "${text}"`);

            if (to) {
                // Scenario 1: Admin sending message to a specific user
                if (senderRole === 'admin') {
                    const targetSocketIds = userSockets.get(to);

                    if (targetSocketIds && targetSocketIds.size > 0) {
                        targetSocketIds.forEach(targetSocketId => {
                            io.to(targetSocketId).emit('message', formattedMessage);
                        });
                        console.log(`Admin message from ${senderName} sent to user ${to} on ${targetSocketIds.size} sockets.`);
                    } else {
                        console.log(`Target user ${to} is not currently connected. Message not sent.`);
                        socket.emit('chatError', {
                            code: 'USER_OFFLINE',
                            message: `User ${to} is currently offline. Message not sent.`
                        });
                    }
                } else {
                    console.warn(`Non-admin user ${senderName} (${senderId}) attempted to send a targeted message.`);
                    socket.emit('chatError', 'You do not have permission to send targeted messages.');
                }
            } else {
                // Scenario 2: User sending a message (implicitly to admin)
                if (senderRole === 'user') {
                    lastMessageTimestamps.set(senderId, formattedMessage.timestamp);
                    io.to('adminRoom').emit('message', formattedMessage);
                    console.log(`User message from ${senderName} broadcasted to adminRoom.`);
                } else if (senderRole === 'admin') {
                    console.log(`Admin ${senderName} sent a general (non-targeted) message.`);
                }

                const senderSocketIds = userSockets.get(senderId);
                if (senderSocketIds && senderSocketIds.size > 1) {
                    senderSocketIds.forEach(targetSocketId => {
                        if (targetSocketId !== socket.id) {
                            io.to(targetSocketId).emit('message', formattedMessage);
                        }
                    });
                }
            }
        });

        // --- Other Events (Notifications and Actions) ---
        socket.on('newRequest', (data) => {
            console.log("New request event received from:", username);
            io.to('adminRoom').emit('adminNotification', {
                from: username,
                message: `New request from ${username}.`,
                data: data,
                timestamp: new Date().toISOString()
            });
        });

        socket.on('adminAcknowledgeMessage', (data) => {
            const { userId: acknowledgedUserId } = data;
            if (userRole === 'admin' && acknowledgedUserId) {
                console.log(`Admin ${username} acknowledged messages from user ${acknowledgedUserId}.`);
                io.to('adminRoom').emit('messageAcknowledged', { userId: acknowledgedUserId, acknowledgedBy: userId, timestamp: new Date().toISOString() });
            }
        });

        // --- Disconnect Event ---
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id} (User: ${username}, Role: ${userRole})`);
            if (userId && userSockets.has(userId)) {
                userSockets.get(userId).delete(socket.id);
                if (userSockets.get(userId).size === 0) {
                    userSockets.delete(userId);
                    console.log(`User ${username} (${userId}) no longer has active connections.`);
                } else {
                    console.log(`User ${username} (${userId}) now has ${userSockets.get(userId).size} active connections.`);
                }
            }
        });
    });
};