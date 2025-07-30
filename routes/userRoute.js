const express = require("express");
const router = express.Router();

// ## 1. Import Controllers and All Middlewares ##
const {
    registerUser,
    loginUser,
    getApprovedUser,
    approveUser,
    deleteUser,
    getMe,
    updateMe,
    changePassword,
    socialLogin // Ensure socialLogin is exported from your controller
} = require("../controller/userController");

const { authorizeToken, requireAdmin } = require("../middleware/authMiddleware");

// Import the new security middlewares
const authLimiter = require('../middleware/rateLimiter');
const verifyRecaptcha = require('../middleware/recaptcha');


// ## 2. Define Public Routes with Security Layers ##

// User registration with rate limiting and reCAPTCHA
router.post('/register', [authLimiter], registerUser);

// User login with rate limiting and reCAPTCHA
router.post("/login", [authLimiter], loginUser);

// Social login (Google/Facebook) - reCAPTCHA is not typically used here
// as these providers have their own security.
router.post('/social-login', socialLogin);


// ## 3. Define Protected User Routes ##

// Get personal profile information
router.get('/me', authorizeToken, getMe);

// Update personal profile information
router.put('/me', authorizeToken, updateMe);

// Change password for the logged-in user
router.put('/changepassword', authorizeToken, changePassword);

// Donor: see all approved users
router.get('/approved', authorizeToken, getApprovedUser);


// ## 4. Define Admin-Only Routes ##

// Admin: approve a user
router.put('/:id/approve', authorizeToken, requireAdmin, approveUser);

// Admin: delete a user
router.delete('/:id', authorizeToken, requireAdmin, deleteUser);


module.exports = router;