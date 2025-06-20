const Patient=require("../model/patient")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")


// Create patient (register)
exports.createPatient=async(req, res) =>{
  const { name, disease, description, contact, password } = req.body;
  try {
    const existing = await Patient.findOne({ contact:contact });
    if (existing) {
      return res.status(400).json({ success: false, message: "Patient with this contact already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      name,
      disease,
      description,
      contact,
      password: hashedPassword // store hashed password
    });

    await newPatient.save();
    res.status(201).json({ success: true, message: "Patient registered", data: newPatient });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Login patient
exports.loginPatient=async(req, res) =>{
  const { contact, password } = req.body;
  try {
    const patient = await Patient.findOne({ contact:contact });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        contact: patient.contact
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
}


// Get all approved patients (for donor dashboard)
exports.getApprovedPatients=async(req, res)=> {
    const patients = await find({ isApproved: true });
    res.status(200).json({ success: true, data: patients });
}

// Admin: Approve patient
exports.approvePatient=async(req, res) =>{
    const patient = await findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    patient.isApproved = true;
    await patient.save();
    res.json({ success: true, message: "Patient approved" });
}

// Admin: Delete patient
exports.deletePatient=async(req, res) =>{
    await findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Patient deleted" });
}
