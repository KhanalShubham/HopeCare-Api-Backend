const express = require('express');
const axios = require('axios');
const router = express.Router();
const Donation = require('../model/Donation');
const Request = require('../model/Request');
const { sendNotificationToUser } = require('../services/notificationServices');
const { sendMail } = require('../services/emailService');
const donationController = require('../controller/donationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/khalti-payment-initiate', async (req, res) => {
    console.log("hi");
  try {
    const {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info
    } = req.body;

    const response = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        return_url,
        website_url,
        amount,
        purchase_order_id,
        purchase_order_name,
        customer_info
      },
      {
        headers: {
          Authorization: 'key 9268968c84424268ae42b83fb7419450',
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Khalti API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Khalti payment initiation failed." });
  }
});



// Admin: List donations
router.get('/admin/list', authMiddleware.authorizeToken, authMiddleware.requireAdmin, donationController.listDonations);
// Admin: Export donations as CSV
router.get('/admin/export', authMiddleware.authorizeToken, authMiddleware.requireAdmin, donationController.exportDonations);

module.exports = router;