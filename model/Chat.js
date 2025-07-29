const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: {
        type: String, 
        ref: 'User', 
        required: true,
    },
    receiver: {
        type: String, 
        ref: 'User',
        required: true,
    },
    // The actual message content
    message: {
        type: String,
        required: function() { return !this.fileUrl; }, // Required if no fileUrl
    },
    // For file attachments
    fileUrl: {
        type: String, // URL or path to the uploaded file
        required: function() { return !this.message; }, // Required if no message
    },
    fileName: { // Name of the file, if attached
        type: String,
    },
    messageType: { // e.g., 'text', 'image', 'document', 'audio'
        type: String,
        enum: ['text', 'image', 'document', 'audio', 'video'], // Define allowed types
        default: 'text',
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    readBy: [{ // Optional: To track if a message has been read by the receiver
        userId: {
            type: String // <<-- IMPORTANT: Changed to String if user IDs in readBy can also be static strings
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});
chatSchema.index({ sender: 1, receiver: 1, timestamp: -1 });
chatSchema.index({ receiver: 1, sender: 1, timestamp: -1 }); // Also for reverse query

module.exports = mongoose.model('Chat', chatSchema);