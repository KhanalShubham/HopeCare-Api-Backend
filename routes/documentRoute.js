const express = require("express");
const router = express.Router();
const documentController = require("../controller/documentController");
const upload = require("../middleware/uploadmiddleware");
const {authenticateToken} = require("../middleware/admin/adminauthenticatemiddleware");
const {authorizeToken} = require("../middleware/patientMiddleware");

// Upload document (patient side)
router.post("/add", authorizeToken ,upload.single("file"), documentController.addDocument);

// Get all documents by patient ID (admin view)
router.get("/patient/:patientId", documentController.getDocumentsByPatient);

//update all document by update ID
router.put("/update/:documentId", documentController.updadateDocument);

// Delete document by document ID
router.delete("/:documentId", documentController.deleteDocument);

module.exports = router;
