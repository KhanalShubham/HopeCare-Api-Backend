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
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true
        },
        status: {
            type: String,
            enum: ["approved", "pending", "declined"], // Corrected enum values
            default: "pending"
        },
        feedback: {
            type: String,
            trim: true
        }
    },
    {

        timestamps: true
    }
);

const Request = mongoose.model('Request', RequestSchema);

module.exports = Request;