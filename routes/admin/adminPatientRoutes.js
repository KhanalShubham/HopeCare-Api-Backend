const express = require('express');
const router = express.Router();
const {
    getAllPatients, getPatientById,
    deletePatient, updatePatient, addPatient
} = require('../../controller/admin/adminPatientController');
const upload=require("../../middleware/fileupload");

const { authenticateToken, requireAdmin } = require("../../middleware/admin/adminauthenticatemiddleware");

router.post("/add-patient",authenticateToken,requireAdmin,upload.single("image"),addPatient);


// List all patients
router.get("/", authenticateToken, requireAdmin, getAllPatients);

// Get patient by ID
router.get("/:id", authenticateToken, requireAdmin, getPatientById);

// Delete patient
router.delete("/:id", authenticateToken, requireAdmin, deletePatient);

// Update patient (optional)
router.put("/:id", authenticateToken, requireAdmin,upload.single("image"), updatePatient);

module.exports = router;
