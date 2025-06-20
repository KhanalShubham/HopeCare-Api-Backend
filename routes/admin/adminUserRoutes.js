const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser} = require("../../controller/admin/adminUserController");
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
router.post(
    "/users",
    authenticateToken,
    requireAdmin,
    createUser
)
router.delete(
    "/user/:id",
    authenticateToken,
    requireAdmin,
    deleteUser
)
router.put(
    "/user/:id",
    authenticateToken,
    requireAdmin,
    updateUser
)

module.exports = router;
