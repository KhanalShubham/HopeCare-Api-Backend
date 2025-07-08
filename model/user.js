const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        // --- ADDED THIS SECTION ---
        // This 'role' field is crucial for distinguishing between users and admins.
        role: {
            type: String,
            enum: ['user', 'admin'], // Defines the only possible values for role
            default: 'user'         // Automatically sets new accounts to 'user'
        },
        // --- END OF ADDED SECTION ---

        disease: {
            type: String,
            // --- UPDATED THIS ---
            // Now, 'disease' is only required if the role is 'user'.
            required: function() { return this.role === 'user'; }
        },
        description: {
            type: String
        },
        contact: {
            type: String,
            unique: true,
            // --- UPDATED THIS ---
            // 'contact' is also only required if the role is 'user'.
            required: function() { return this.role === 'user'; }
        },
        filepath: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);