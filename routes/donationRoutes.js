const express = require('express');
const axios = require('axios');
const router = express.Router();
const Donation = require('../model/Donation'); // Adjust path if needed
const Request = require('../model/Request');   // This seems to be your Campaign model

router.post('/khalti-payment-verification', async (req, res) => {
    try {
        // 1. Get the data sent from the frontend
        const { token, amount, campaignId, donorDetails } = req.body;

        if (!token || !amount || !campaignId || !donorDetails) {
            return res.status(400).json({ success: false, message: "Missing required payment data." });
        }

        // 2. Prepare data for Khalti's verification API
        const verificationData = {
            token: token,
            amount: amount * 100 // IMPORTANT: Khalti's verification API expects the amount in paisa
        };

        // 3. Send the verification request to Khalti's server
        const khaltiResponse = await axios.post(
            'https://khalti.com/api/v2/payment/verify/', // <-- This is the VERIFICATION URL
            verificationData,
            {
                headers: {
                    // Use your SECRET key for server-to-server communication
                    'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`
                }
            }
        );

        // 4. Check if Khalti confirmed the payment
        if (khaltiResponse.data && khaltiResponse.data.state === 'Completed') {
            const transactionId = khaltiResponse.data.idx;

            // 5. IMPORTANT: Check if this transaction has already been processed
            const existingDonation = await Donation.findOne({ transactionId: transactionId });
            if (existingDonation) {
                return res.status(409).json({ success: false, message: 'This transaction has already been processed.' });
            }

            // 6. Save the new donation to your database with the donor's details
            const newDonation = new Donation({
                campaignId: campaignId,
                amount: amount, // Save the amount in rupees
                donorName: donorDetails.isAnonymous ? 'Anonymous' : donorDetails.name,
                donorEmail: donorDetails.email, // Always save the email for receipts
                isAnonymous: donorDetails.isAnonymous,
                paymentGateway: 'Khalti',
                transactionId: transactionId, // Use the unique ID from Khalti
                paymentStatus: 'success'
            });
            await newDonation.save();

            // 7. Update the campaign's total raised amount
            await Request.findByIdAndUpdate(campaignId, { $inc: { raisedAmount: amount } });

            // 8. Send a success response back to the frontend
            return res.status(200).json({ success: true, message: 'Payment verified and recorded successfully.' });

        } else {
            // If Khalti's verification fails
            console.error("Khalti verification failed:", khaltiResponse.data);
            return res.status(400).json({ success: false, message: 'Payment verification failed.', details: khaltiResponse.data });
        }

    } catch (error) {
        console.error("Khalti verification server error:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Server error during payment verification.' });
    }
});


module.exports = router;