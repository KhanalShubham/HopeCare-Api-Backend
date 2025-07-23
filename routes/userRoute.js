const express = require("express")
const router = express.Router()
const {registerUser, loginUser, getApprovedUser, approveUser, deleteUser, getMe, updateMe, changePassword}=require("../controller/userController");
const {authorizeToken,requireAdmin} = require("../middleware/authMiddleware");

// User registration (from mobile)
router.post('/register', registerUser);

router.post("/login", loginUser )

// Donor: see all approved user
router.get('/approved', authorizeToken, getApprovedUser);

// router.getAll("/", authorizeToken, )

// Admin: approve patient
router.put('/:id/approve', authorizeToken, requireAdmin, approveUser);

// Admin: delete patient
router.delete('/:id', authorizeToken, requireAdmin, deleteUser);
router.get('/me', authorizeToken, getMe);
router.put('/me', authorizeToken, updateMe); // ✅ Route for updating profile
router.put('/changepassword', authorizeToken, changePassword); // ✅ Route for changing password
// Social login (Google/Facebook)
router.post('/social-login', require('../controller/userController').socialLogin);
// Change it to this:


module.exports=router
