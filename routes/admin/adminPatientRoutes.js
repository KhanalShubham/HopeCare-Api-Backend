const express = require('express');
const router = express.Router();
const {
    getAllPatients, getPatientById,
    deletePatient, updatePatient, addPatient
} = require('../../controller/admin/adminPatientController');
const upload=require("../../middleware/fileupload");

// const { authenticateToken, requireAdmin } = require("../../middleware/admin/adminauthenticatemiddleware");
const {authorizeToken,requireAdmin} = require("../../middleware/authMiddleware");

router.post("/add-patient",authorizeToken,requireAdmin,upload.single("image"),addPatient);


// List all patients
router.get("/", authorizeToken, requireAdmin, getAllPatients);

// Get patient by ID
router.get("/:id", authorizeToken, requireAdmin, getPatientById);

// Delete patient
router.delete("/:id", authorizeToken, requireAdmin, deletePatient);

// Update patient (optional)
router.put("/:id", authorizeToken, requireAdmin,upload.single("image"), updatePatient);

module.exports = router;

