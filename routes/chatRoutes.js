const express = require('express');
const router = express.Router();
const { getChatHistory, getConversations } = require('../controller/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Route for any authenticated user to get their chat history with another user
router.get('/history/:otherUserId', authMiddleware.authorizeToken, getChatHistory);

// Route ONLY for an admin to get a list of all their past conversations
router.get('/conversations', authMiddleware.authorizeToken, authMiddleware.requireAdmin, getConversations);

module.exports = router;