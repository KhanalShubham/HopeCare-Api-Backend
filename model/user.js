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
        role: {
            type: String,
            enum: ['user', 'admin'], 
            default: 'user'        
        },


        disease: {
            type: String,
            required: function() { return this.role === 'user'; }
        },
        description: {
            type: String
        },
        contact: {
            type: String,
            unique: true,
            required: function() { return this.role === 'user'; }
        },
        filepath: {
            type: String
        },
        photoUrl: { type: String, default: "" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);