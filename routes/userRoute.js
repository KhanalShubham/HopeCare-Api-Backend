const express = require("express")
const router = express.Router()
const {registerUser, loginUser, getApprovedUser, approveUser, deleteUser}=require("../controller/userController");
const {authorizeToken,requireAdmin} = require("../middleware/authMiddleware");

// User registration (from mobile)
router.post('/register', registerUser);

router.post("/login", loginUser )

// Donor: see all approved patients
router.get('/approved', authorizeToken, getApprovedUser);

// router.getAll("/", authorizeToken, )

// Admin: approve patient
router.put('/:id/approve', authorizeToken, requireAdmin, approveUser);

// Admin: delete patient
router.delete('/:id', authorizeToken, requireAdmin, deleteUser);

module.exports=router
