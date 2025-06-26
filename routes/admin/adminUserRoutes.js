const express = require('express');
const router = express.Router();
const {
    getAllUsers, getUserById,
    deleteUser, updateUser, addUser
} = require('../../controller/admin/adminUserController');
const upload=require("../../middleware/fileupload");

// const { authenticateToken, requireAdmin } = require("../../middleware/admin/adminauthenticatemiddleware");
const {authorizeToken,requireAdmin} = require("../../middleware/authMiddleware");

router.post("/add-patient",authorizeToken,requireAdmin,upload.single("image"),addUser);


// List all patients
router.get("/", authorizeToken, requireAdmin, getAllUsers);

// Get patient by ID
router.get("/:id", authorizeToken, requireAdmin, getUserById);

// Delete patient
router.delete("/:id", authorizeToken, requireAdmin, deleteUser);

// Update patient (optional)
router.put("/:id", authorizeToken, requireAdmin,upload.single("image"), updateUser);

module.exports = router;

