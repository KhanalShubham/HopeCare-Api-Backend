// models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        fileType: {
            type: String
        },
        userImage: {
            type: String,
            required: true,
        },
        citizenshipImage: {
            type: String,
            required: true,
        },
        neededAmount:{
            type:Number,
        },
        originalAmount:{
            type:Number,
        },
        condition:{
            type:String,
            enum:["critical", "moderate"],
            default:"moderate"
        },
        inDepthStory:{
            type:String
        },
        citizen:{
            type:String
        },
        description: {
            type: String
        },
        // The user (e.g., Patient) who uploaded the request
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Make sure you have a 'Patient' model
            required: true
        },
        // The status of the request, managed by the admin
        status: {
            type: String,
            enum: ["approved", "pending", "declined"], // Corrected enum values
            default: "pending"
        },
        // Feedback provided by the admin on approval or declination
        feedback: {
            type: String,
            trim: true
        }
    },
    {
        // Automatically adds createdAt and updatedAt fields
        timestamps: true
    }
);

const Request = mongoose.model('Request', RequestSchema);

module.exports = Request;