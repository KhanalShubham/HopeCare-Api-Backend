const Document = require("../model/document");
const fs = require('fs');
const path = require('path');

// Add new document (with file)
exports.addDocument = async (req, res) => {
  try {
    const { description, patientId, uploadedBy } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File not uploaded" });
    }

    const newDoc = new Document({
      filename: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      description,
      patient: patientId,
      uploadedBy
    });

    await newDoc.save();
    res.status(201).json({ message: "Document uploaded successfully", document: newDoc });

  } catch (error) {
    res.status(500).json({ message: "Failed to upload document", error });
  }
};

// Get all documents of a patient
exports.getDocumentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const documents = await Document.find({ patient: patientId }).populate("uploadedBy", "name email");
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch documents", error });
  }
};

// Delete document by document ID
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from disk
    fs.unlink(path.join(__dirname, '..', document.filePath), (err) => {
      if (err) console.error('Failed to delete file from storage:', err);
    });

    await Document.findByIdAndDelete(documentId);
    res.status(200).json({ message: "Document deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete document", error });
  }
};
