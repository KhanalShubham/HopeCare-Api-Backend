// controllers/requestController.js

const Request = require('../model/Request');
const fs = require('fs');
const path = require('path');

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
    const { description } = req.body;
    // Assuming user ID is available from auth middleware (e.g., req.user.id)
    const patientId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File is required." });
    }

    const newRequest = new Request({
      filename: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      description,
      uploadedBy: patientId,
      status: 'pending' // Explicitly set to pending
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Request submitted successfully. It is now pending review.",
      data: newRequest
    });

  } catch (error) {
    console.error("Add Request Error:", error);
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
        .sort({ createdAt: -1 }); // Show most recent first

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error("Fetch My Requests Error:", error);
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

    // Ensure the user owns the request
    if (request.uploadedBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized to delete this request." });
    }

    // Optional: Only allow deletion if the request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Cannot delete a request that has already been reviewed." });
    }

    // --- FIX #2: Robust File Path Deletion ---
    // Construct the absolute path from the project root to be safe.
    // This assumes the controller is in a `/controllers` folder and uploads are in `/uploads`.
    const absoluteFilePath = path.join(__dirname, '..', request.filePath);

    fs.unlink(absoluteFilePath, (err) => {
      if (err) {
        // This is not a critical error if the file is already gone, so we just log it.
        console.error("Info: File could not be deleted (it may have been removed already):", err.message);
      } else {
        console.log("Successfully deleted file from filesystem:", absoluteFilePath);
      }
    });

    // --- FIX #1: Use deleteOne() instead of remove() ---
    await request.deleteOne();

    res.status(200).json({ success: true, message: "Request deleted successfully." });

  } catch (error) {
    console.error("Delete Request Error:", error);
    res.status(500).json({ success: false, message: "Server Error: Could not delete request." });
  }
};


// ===============================================
// ADMIN-FACING FUNCTIONS
// ===============================================

/**
 * @desc    Get all requests for admin view, sorted by date.
 *          Can be filtered by status (e.g., /api/requests/admin?status=pending)
 * @route   GET /api/requests/admin
 * @access  Private (Admin)
 */
exports.getAllRequestsForAdmin = async (req, res) => {
  try {
    const query = {};

    // Filter by status if provided in query params
    if (req.query.status && ["pending", "approved", "declined"].includes(req.query.status)) {
      query.status = req.query.status;
    }

    // To get requests for the "current date" (today), you can add a date filter
    // For example: /api/requests/admin?date=today
    if (req.query.date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: start, $lt: end };
    }

    const requests = await Request.find(query)
        .populate('uploadedBy', 'name email') // Populate user info (adjust fields as needed)
        .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully.",
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error("Admin Fetch Requests Error:", error);
    res.status(500).json({ success: false, message: "Server Error: Could not fetch requests." });
  }
};

//get request by patient

/**
 * @desc    Approve or Decline a request
 * @route   PATCH /api/requests/admin/:id/status
 * @access  Private (Admin)
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    console.log(req.body)
    const { status, feedback } = req.body;

    // Validate input
    if (!status || !['approved', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided. Must be 'approved' or 'declined'." });
    }

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ success: false, message: "Feedback is required when updating status." });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    // You might want to prevent re-approving/declining
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${request.status}.`})
    }

    request.status = status;
    request.feedback = feedback;

    await request.save();

    res.status(200).json({
      success: true,
      message: `Request has been successfully ${status}.`,
      data: request
    });

  } catch (error) {
    console.error("Update Request Status Error:", error);
    res.status(500).json({ success: false, message: "Server Error: Could not update request status."+error });
  }
};