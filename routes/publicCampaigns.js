// routes/publicCampaigns.js
const express = require('express');
const router = express.Router();
const Request = require('../model/Request'); // Adjust the path to your model

// @route   GET /api/campaigns
// @desc    Get all publicly visible (approved) campaigns
// @access  Public
router.get('/', async (req, res) => {
    try {
        const campaigns = await Request.find({ status: 'approved' })
            .populate('uploadedBy', 'name') // Fetches the patient's name
            .sort({ createdAt: -1 });      // Shows the newest campaigns first

        // IMPORTANT: We add the raisedAmount and donors here manually for now.
        // Later, this is where you'll calculate the real values from your donation system.
        const publicCampaigns = campaigns.map(campaign => ({
            _id: campaign._id,
            title: `Help ${campaign.uploadedBy?.name || 'Someone'}`,
            description: campaign.description,
            userImage: campaign.userImage,
            goalAmount: campaign.neededAmount, // The goal set by the admin
            raisedAmount: 0, // Hardcoded to 0 for now
            donors: 0,       // Hardcoded to 0 for now
        }));

        res.json(publicCampaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;