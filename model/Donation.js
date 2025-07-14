const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    amount: { type: Number, required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    paymentGateway: { type: String, enum: ['Khalti'], required: true },
    transactionId: { type: String, unique: true, sparse: true },
    paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
