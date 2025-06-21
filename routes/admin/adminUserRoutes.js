const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser} = require("../../controller/admin/adminUserController");
const { authenticateToken, requireAdmin } = require("../../middleware/admin/adminauthenticatemiddleware");

const router = express.Router();

// Get all users (admin only)
router.get(
    "/",
    authenticateToken,
    requireAdmin,
    getAllUsers
);

// Get user by ID (admin only)
router.get(
    "/:id",
    authenticateToken,
    requireAdmin,
    getUserById
);
router.post(
    "/add-user",
    authenticateToken,
    requireAdmin,
    createUser
)
router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    deleteUser
)
router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    updateUser
)

module.exports = router;
