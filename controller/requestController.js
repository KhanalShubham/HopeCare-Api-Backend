// controller/requestController.js
const Request = require('../model/Request');
const User = require('../model/user'); // Assuming you also need User model here
const fs = require('fs');
const path = require('path');
const { sendNotificationToUser } = require('../services/notificationServices'); // <--- NEW IMPORT

// Constants for allowed request statuses
const ALLOWED_STATUSES = ["pending", "approved", "declined"];

// ===============================================
// USER/PATIENT-FACING FUNCTIONS
// ===============================================

/**
 * @desc    Add a new request
 * @route   POST /api/requests
 * @access  Private (User)
 */
exports.addRequest = async (req, res) => {
  try {
    const { description, neededAmount, condition, inDepthStory, citizen } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Authentication error: User not found." });
    }
    const userId = req.user.id;

    if (!description || !neededAmount || !condition || !inDepthStory || !citizen) {
      return res.status(400).json({ success: false, message: "All text fields are required." });
    }

    if (!req.files || !req.files.file || !req.files.userImage || !req.files.citizenshipImage) {
      return res.status(400).json({ success: false, message: "All three files are required." });
    }
    const amount=Number(neededAmount);
    if(isNaN(amount)||amount<0){
      return res.status(400).json({success:false, message:"A valid and a positive amount is required"});
    }

    const supportingDoc = req.files.file[0];
    const userImageFile = req.files.userImage[0];
    const citizenshipImageFile = req.files.citizenshipImage[0];

    const supportingDocPath = `uploads/documents/${supportingDoc.filename}`;
    const userImagePath = `uploads/documents/${userImageFile.filename}`;
    const citizenshipImagePath = `uploads/documents/${citizenshipImageFile.filename}`;

    const newRequest = new Request({
      filename: supportingDoc.filename,
      filePath: supportingDocPath,
      fileType: supportingDoc.mimetype,
      userImage: userImagePath,
      citizenshipImage: citizenshipImagePath,
      description,
      neededAmount,
      originalAmount:neededAmount,
      condition,
      inDepthStory,
      citizen,
      uploadedBy: userId,
      status: 'pending'
    });

    await newRequest.save();

    await User.findByIdAndUpdate(userId, { filepath: userImagePath });

    res.status(201).json({
      success: true,
      message: "Request submitted successfully.",
      data: newRequest
    });

  } catch (error) {
    console.error("ADD REQUEST ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error: Could not add request." });
  }
};


/**
 * @desc    Get all requests for the currently logged-in user
 * @route   GET /api/requests/my-requests
 * @access  Private (User)
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ uploadedBy: req.user.id })
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error("Fetch My Requests Error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Server Error: Could not fetch requests." });
  }
};

/**
 * @desc    Delete a request
 * @route   DELETE /api/requests/:id
 * @access  Private (User - Owner)
 */
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (request.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this request." });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Cannot delete a request that has already been reviewed." });
    }

    const absoluteFilePath = path.join(__dirname, '..', request.filePath);

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlink(absoluteFilePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err.message);
        } else {
          console.log("Successfully deleted file:", absoluteFilePath);
        }
      });
    } else {
      console.warn("File not found for deletion, but proceeding to delete DB record:", absoluteFilePath);
    }

    await request.deleteOne();

    res.status(200).json({ success: true, message: "Request deleted successfully." });

  } catch (error) {
    console.error("Delete Request Error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Server Error: Could not delete request." });
  }
};

// ===============================================
// ADMIN-FACING FUNCTIONS
// ===============================================

/**
 * @desc    Get all requests for admin, optionally filtered by status and date
 * @route   GET /api/requests/admin
 * @access  Private (Admin)
 */
exports.getAllRequestsForAdmin = async (req, res) => {
  try {
    const query = {};

    if (req.query.status && ALLOWED_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }

    if (req.query.date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lt: end };
    }

    const requests = await Request.find(query)
        .populate('uploadedBy', 'name email filepath')
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully.",
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error("Admin Fetch Requests Error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Server Error: Could not fetch requests." });
  }
};

/**
 * @desc    Approve or Decline a request
 * @route   PATCH /api/requests/admin/:id/status
 * @access  Private (Admin)
 */
exports.updateRequestStatus = async (req, res) => {
  console.log(req.body);
  try {
    const { status, neededAmount, feedback } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status) || status === 'pending') {
      return res.status(400).json({ success: false, message: "Invalid status provided. Must be 'approved' or 'declined'." });
    }

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ success: false, message: "Feedback is required when updating status." });
    }

    if (!neededAmount || isNaN(neededAmount) || Number(neededAmount) < 0) {
      return res.status(400).json({ success: false, message: "A valid needed amount is required" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${request.status}.` });
    }

    request.status = status;
    request.feedback = feedback;
    request.neededAmount = neededAmount;
    await request.save();

    // --- NEW: Trigger Notification for Request Status Change ---
    if (request.uploadedBy) {
      let notificationTitle;
      let notificationBody;

      switch (status) {
        case 'approved':
          notificationTitle = 'Your Request Has Been Approved!';
          notificationBody = `Great news! Your request for "${request.description}" has been approved for Rs. ${request.neededAmount}.`;
          break;
        case 'declined':
          notificationTitle = 'Your Request Has Been Declined.';
          notificationBody = `Unfortunately, your request for "${request.description}" has been declined. Feedback: ${feedback || 'N/A'}.`;
          break;
          // 'pending' status changes are generally not notified here as this action moves it *from* pending.
      }

      const notificationData = {
        type: 'request_status_update',
        requestId: request._id.toString(),
        newStatus: status,
        description: request.description,
        feedback: feedback || 'No additional feedback.',
      };

      await sendNotificationToUser(request.uploadedBy.toString(), {
        title: notificationTitle,
        body: notificationBody,
        data: notificationData
      });
    }

    res.status(200).json({
      success: true,
      message: `Request has been successfully ${status}.`,
      data: request
    });

  } catch (error) {
    console.error("Update Request Status Error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Server Error: Could not update request status." });
  }
};