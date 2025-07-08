const Chat = require('../model/Chat');
const User = require('../model/user');

const ADMIN_ID = process.env.ADMIN_ID;

// --- EXISTING FUNCTION (CORRECTED) ---
exports.getChatHistory = async (req, res) => {
    // History is between the logged-in user and the user ID from the URL.
    // For admin, otherUserId will be a user's ID. For a user, it will be the ADMIN_ID.
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    if (!currentUserId || !otherUserId) {
        return res.status(400).json({ success: false, message: "User IDs are required." });
    }

    try {
        const messages = await Chat.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
            .sort({ timestamp: 1 })
            .populate('sender', 'name email role')
            .limit(200);

        res.status(200).json({ success: true, messages });

    } catch (error) {
        console.error("CHAT_CONTROLLER: Error fetching chat history:", error);
        res.status(500).json({ success: false, message: "Server error fetching chat history." });
    }
};

// --- NEW FUNCTION TO GET CONVERSATION LIST FOR ADMIN ---
exports.getConversations = async (req, res) => {
    const adminId = process.env.ADMIN_ID;
    if (req.user.id !== adminId) {
        return res.status(403).json({ success: false, message: "Forbidden." });
    }

    try {
        const userIds = await Chat.distinct('sender', { receiver: adminId });
        const userIdsFromAdmin = await Chat.distinct('receiver', { sender: adminId });

        const allUserIds = [...new Set([...userIds, ...userIdsFromAdmin])];
        const users = await User.find({ '_id': { $in: allUserIds } }).select('name email');

        res.status(200).json({ success: true, conversations: users });

    } catch (error) {
        console.error("CHAT_CONTROLLER: Error fetching conversation list:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};