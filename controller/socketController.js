const Chat = require('../model/Chat');
const User = require('../model/user');

const ADMIN_ID = process.env.ADMIN_ID;

module.exports = (io) => {
    if (!ADMIN_ID) {
        console.error("\nFATAL ERROR: process.env.ADMIN_ID is not set. The chat system cannot function.\n");
        process.exit(1);
    }

    io.on('connection', (socket) => {
        const userId = socket.user?.id;
        const userRole = socket.user?.role;
        const username = socket.user?.name || 'Anonymous';

        if (!userId) return socket.disconnect();

        console.log(`✅ SOCKET CONNECTED: ${socket.id} (User: ${username}, ID: ${userId}, Role: ${userRole})`);

        socket.join(userId);
        if (userRole === 'admin') {
            socket.join('adminRoom');
            console.log(`👑 Admin ${username} has joined the 'adminRoom'.`);
        }

        // --- CORE MESSAGING ---
        socket.on('message', async (messageData) => {
            const { to, text, fileUrl, messageType, fileName } = messageData;
            const senderId = userId;
            const senderRole = userRole;

            if (!text && !fileUrl) return;

            let receiverId = (senderRole === 'admin') ? to : ADMIN_ID;

            if (!receiverId) {
                console.error("SOCKET_CONTROLLER: Could not determine receiver for admin message.", { senderRole, to });
                return;
            }

            try {
                const newMessage = new Chat({
                    sender: senderId,
                    receiver: receiverId,
                    message: text || '',
                    fileUrl: fileUrl,
                    fileName: fileName,
                    messageType: messageType || (fileUrl ? 'document' : 'text'),
                });
                const savedMessage = await newMessage.save();
                const populatedMessage = await Chat.findById(savedMessage._id).populate('sender', 'name email role');
                const messageToBroadcast = populatedMessage.toObject();

                const targetRoom = (senderRole === 'user') ? 'adminRoom' : receiverId;
                io.to(targetRoom).emit('message', messageToBroadcast);
                io.to(senderId).emit('message', messageToBroadcast);

            } catch (error) {
                console.error("SOCKET_CONTROLLER: Error saving or broadcasting message:", error);
            }
        });

        // --- WEBRTC VIDEO CALL SIGNALING ---

        // A. USER calls ADMIN
        socket.on('start-call', (data) => {
            console.log(`📞 User ${username} (${userId}) is calling the admin.`);
            io.to('adminRoom').emit('incoming-call', {
                from: userId,
                name: username,
                signalData: data.signalData,
            });
        });

        // B. ADMIN answers USER's call
        socket.on('answer-call', (data) => {
            console.log(`🤝 Admin ${username} is answering call from user ${data.to}.`);
            io.to(data.to).emit('call-accepted', { signalData: data.signalData });
        });

        // C. ADMIN calls USER (NEW)
        socket.on('admin-start-call', (data) => {
            const { to, signalData } = data;
            console.log(`📞 Admin ${username} is calling user ${to}`);
            io.to(to).emit('incoming-admin-call', {
                from: userId,
                name: username,
                signalData,
            });
        });

        // D. USER answers ADMIN's call (NEW)
        socket.on('user-answered-call', (data) => {
            const { to, signalData } = data; // 'to' is the admin's ID
            console.log(`🤝 User ${username} is answering call from admin ${to}.`);
            io.to(to).emit('user-answered', { signalData, from: userId });
        });

        // E. GENERIC call end event
        socket.on('end-call', (data) => {
            const { to } = data;
            console.log(`🔌 Call between ${userId} and ${to} is ending.`);
            const targetRoom = (userRole === 'admin') ? to : 'adminRoom';
            io.to(targetRoom).emit('call-ended', { from: userId });
        });

        // --- DISCONNECT ---
        socket.on('disconnect', () => {
            console.log(`❌ SOCKET DISCONNECTED: ${socket.id}`);
        });
    });
};