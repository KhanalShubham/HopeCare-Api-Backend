// models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    amount: { type: Number, required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false }, // User chooses this in the form
    paymentGateway: { type: String, required: true }, // 'Khalti', 'Esewa'
    transactionId: { type: String, required: true }, // From the payment gateway
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);