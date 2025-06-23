const Document = require("../model/document");
const fs = require('fs');
const path = require('path');

// Add new document (with file)
exports.addDocument = async (req, res) => {
  try {
    const { description } = req.body;
    const patientId = req.user.id

    if(!patientId){
      return res.status(404).json({ message: "Patient not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File not uploaded" });
    }

    const newDoc = new Document({
      filename: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      description,
      uploadedBy: patientId
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
    const {patientId}  = req.params;

    if(!patientId){
      res.status(404).json({ message: "Patient not found." });

    }
    const documents = await Document.find({ uploadedBy: patientId }).populate("uploadedBy", "name contact");
    return res.status(200).json({
      success: true,
      message: "Patient documents fetched.",
      data: documents
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch documents", error });
  }
};

exports.updadateDocument=async (req, res)=>{
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request params:', req.params);

    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required"
      });
    }

    // Check if document exists
    const existingDocument = await Document.findById(documentId);
    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    // Prepare update object
    let updateDocument = {};

    // Add description if provided
    if (req.body && req.body.description) {
      updateDocument.description = req.body.description;
    }

    // Add file data if file was uploaded
    if (req.file) {
      updateDocument.filename = req.file.filename;
      updateDocument.filePath = req.file.path; // Note: consistent naming
      updateDocument.fileType = req.file.mimetype;
    }

    // Update the document
    const document = await Document.findByIdAndUpdate(
        documentId,
        updateDocument,
        { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: document
    });

  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to update document: " + error.message
    });
  }
}

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
