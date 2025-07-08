// In a new file, e.g., routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// --- Create a dedicated storage for chat files ---
const chatUploadDir = path.join(__dirname, '..', 'uploads', 'chat');
if (!fs.existsSync(chatUploadDir)) {
    fs.mkdirSync(chatUploadDir, { recursive: true });
}

const chatStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, chatUploadDir);
    },
    filename: (req, file, cb) => {
        // e.g., 1678886400000-user123-my-audio.webm
        const uniqueName = `${Date.now()}-${req.user.id}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: chatStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// --- The new endpoint ---
// The frontend will send a POST request here with the file
router.post('/chat/upload', authMiddleware.authorizeToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Return the publicly accessible URL of the file
    const fileUrl = `/uploads/chat/${req.file.filename}`;
    res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        fileUrl: fileUrl,
        fileName: req.file.originalname,
        // You can infer messageType from the file's mimetype
        messageType: req.file.mimetype.startsWith('image/') ? 'image' :
            req.file.mimetype.startsWith('audio/') ? 'audio' :
                req.file.mimetype.startsWith('video/') ? 'video' : 'document'
    });
});

module.exports = router;