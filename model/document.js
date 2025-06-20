const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String },
    description: { type: String },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },

      isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
