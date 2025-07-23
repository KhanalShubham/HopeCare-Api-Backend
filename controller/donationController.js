const Donation = require('../model/Donation');
const Request = require('../model/Request');
const { Parser } = require('json2csv');

// List donations with optional filters, search, and pagination
exports.listDonations = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, campaignId, paymentStatus } = req.query;
    const query = {};
    if (campaignId) query.campaignId = campaignId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: 'i' } },
        { donorEmail: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }
    const donations = await Donation.find(query)
      .populate('campaignId', 'description')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Donation.countDocuments(query);
    res.json({ success: true, donations, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
  }
};

// Export donations as CSV
exports.exportDonations = async (req, res) => {
  try {
    const { campaignId, paymentStatus } = req.query;
    const query = {};
    if (campaignId) query.campaignId = campaignId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    const donations = await Donation.find(query).populate('campaignId', 'description').sort({ createdAt: -1 });
    const fields = [
      { label: 'Date', value: row => row.createdAt.toISOString() },
      { label: 'Campaign', value: row => row.campaignId?.description || '' },
      { label: 'Amount', value: 'amount' },
      { label: 'Donor Name', value: 'donorName' },
      { label: 'Donor Email', value: 'donorEmail' },
      { label: 'Anonymous', value: 'isAnonymous' },
      { label: 'Payment Gateway', value: 'paymentGateway' },
      { label: 'Transaction ID', value: 'transactionId' },
      { label: 'Status', value: 'paymentStatus' },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(donations);
    res.header('Content-Type', 'text/csv');
    res.attachment('donations.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export donations.' });
  }
}; 