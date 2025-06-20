const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    disease: { type: String, required: true },
    description: { type: String },
    contact: { type: String, required: true, unique: true },

    password: { type: String, required: true },


  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", PatientSchema);
