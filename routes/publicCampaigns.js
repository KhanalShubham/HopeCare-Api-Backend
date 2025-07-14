// routes/publicCampaigns.js
const express = require('express');
const router = express.Router();
const Request = require('../model/Request'); // Adjust the path to your model if needed

// @route   GET /api/campaigns
// @desc    Get all publicly visible (approved) campaigns for the homepage list
// @access  Public
router.get('/', async (req, res) => {
    try {
        const campaigns = await Request.find({ status: 'approved' })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        // Transform the data for the campaign list cards
        const publicCampaigns = campaigns.map(campaign => ({
            _id: campaign._id,
            title: `Help ${campaign.uploadedBy?.name || 'Someone'}`,
            description: campaign.description,
            userImage: campaign.userImage,
            goalAmount: campaign.neededAmount,
            // You will replace these hardcoded values later when you have a donation system
            raisedAmount: 0,
            donors: 0,
        }));

        res.json(publicCampaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/:id', async (req, res) => {
    try {
        const campaign = await Request.findById(req.params.id)
            .populate('uploadedBy', 'name');

        // If the database doesn't find a campaign with this ID, send a 404 error
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Transform the data to match what the DonationPage component expects
        const campaignDetails = {
            _id: campaign._id,
            title: `Help ${campaign.uploadedBy?.name || 'Someone'}`,
            description: campaign.description,
            userImage: campaign.userImage,
            goalAmount: campaign.neededAmount,
            // These will also be calculated later
            raisedAmount: 0,
            donors: 0,
        };

        res.json(campaignDetails);
    } catch (err) {
        console.error(err.message);
        // This handles cases where the provided ID is not a valid MongoDB ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;