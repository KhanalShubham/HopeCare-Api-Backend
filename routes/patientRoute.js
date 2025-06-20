const express = require("express")
const router = express.Router()
const {createPatient, loginPatient, getApprovedPatients, approvePatient, deletePatient}=require("../controller/patientController");
const { authenticateToken, requireAdmin } = require("../middleware/admin/adminauthenticatemiddleware");

// Patient registration (from mobile)
router.post('/create', createPatient);

router.post("/login", loginPatient )

// Donor: see all approved patients
router.get('/approved', authenticateToken, getApprovedPatients);

// router.getAll("/", authenticateToken, )

// Admin: approve patient
router.put('/:id/approve', authenticateToken, requireAdmin, approvePatient);

// Admin: delete patient
router.delete('/:id', authenticateToken, requireAdmin, deletePatient);

module.exports=router
