const express = require('express');
const { getAllUsers, getUserById } = require("../../controller/admin/adminController");
const { authenticateToken, requireAdmin } = require("../../middleware/admin/adminauthenticatemiddleware");

const router = express.Router();

// Get all users (admin only)
router.get(
    "/users",
    authenticateToken,
    requireAdmin,
    getAllUsers
);

// Get user by ID (admin only)
router.get(
    "/users/:id",
    authenticateToken,
    requireAdmin,
    getUserById
);

module.exports = router;
