const express = require("express")
const router = express.Router()
const {createPatient, loginPatient, getApprovedPatients, approvePatient, deletePatient}=require("../controller/patientController");
// const { authorizeToken, requireAdmin } = require("../middleware/admin/adminauthenticatemiddleware");
const {authorizeToken,requireAdmin} = require("../middleware/authMiddleware");

// Patient registration (from mobile)
router.post('/create', createPatient);

router.post("/login", loginPatient )

// Donor: see all approved patients
router.get('/approved', authorizeToken, getApprovedPatients);

// router.getAll("/", authorizeToken, )

// Admin: approve patient
router.put('/:id/approve', authorizeToken, requireAdmin, approvePatient);

// Admin: delete patient
router.delete('/:id', authorizeToken, requireAdmin, deletePatient);

module.exports=router
