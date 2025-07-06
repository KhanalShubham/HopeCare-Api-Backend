// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const {
    addRequest,
    getMyRequests,
    deleteRequest,
    getAllRequestsForAdmin,
    updateRequestStatus
} = require('../controller/requestController');

// You would need to implement this middleware
// authenticateToken: Checks if user is logged in
// requireAdmin: Checks if the logged-in user has an 'admin' role
// const { authenticateToken, requireAdmin } = require('../middleware/admin/adminauthenticatemiddleware');


// Placeholder for file uploads (e.g., using multer)
const upload = require('../middleware/uploadmiddleware');
const {authorizeToken,requireAdmin} = require("../middleware/authMiddleware");
// const {authorizeToken} = require("../middleware/patientMiddleware");


// ===============================================
// USER ROUTES (Requires login)
// ===============================================
router.route('/')
    .post(authorizeToken, upload, addRequest);

router.route('/my-requests')
    .get(authorizeToken, getMyRequests);

router.route('/:id')
    .delete(authorizeToken, deleteRequest);


// ===============================================
// ADMIN ROUTES (Requires admin privileges)
// ===============================================
router.route('/admin')
    .get(authorizeToken, requireAdmin, getAllRequestsForAdmin);

router.route('/admin/:id/status')
    .patch(authorizeToken, requireAdmin, updateRequestStatus);


module.exports = router;