const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser} = require("../../controller/admin/adminUserController");
// const { authenticateToken, requireAdmin } = require("../../middleware/admin/adminauthenticatemiddleware");
const {authorizeToken, requireAdmin} = require("../../middleware/authMiddleware");

const router = express.Router();

// Get all users (admin only)
router.get(
    "/",
    authorizeToken,
    requireAdmin,
    getAllUsers
);

// Get user by ID (admin only)
router.get(
    "/:id",
    authorizeToken,
    requireAdmin,
    getUserById
);
router.post(
    "/add-user",
    authorizeToken,
    requireAdmin,
    createUser
)
router.delete(
    "/:id",
    authorizeToken,
    requireAdmin,
    deleteUser
)
router.put(
    "/:id",
    authorizeToken,
    requireAdmin,
    updateUser
)

module.exports = router;
