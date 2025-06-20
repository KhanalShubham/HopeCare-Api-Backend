const express = require("express");
const router = express.Router();
const documentController = require("../controller/documentController");
const upload = require("../middleware/uploadmiddleware");

// Upload document (patient side)
router.post("/add", upload.single("file"), documentController.addDocument);

// Get all documents by patient ID (admin view)
router.get("/patient/:patientId", documentController.getDocumentsByPatient);

// Delete document by document ID
router.delete("/:documentId", documentController.deleteDocument);

module.exports = router;
