const Patient=require("../../model/patient")
const bcrypt = require("bcrypt");

exports.getAllPatients = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query
        let filters = {}
        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: "i" } }
            ]
        }
        const skips = (page - 1) * limit;

        const patients = await Patient.find(filters)
            .skip(skips)
            .limit(Number(limit))// optional for clarity
            .sort({ createdAt: -1 });

        const total = await Patient.countDocuments(filters)
        return res.status(200).json({
            success: true,
            message: "All patients fetched successfully",
            data: patients,
            pagination:{
                total,
                page:Number(page),
                limit:Number(limit),
                totalPages:Math.ceil(total/limit)
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//  2. Get a single patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        return res.status(200).json({ success: true, data: patient });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//  4. Delete a patient
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        return res.status(200).json({ success: true, message: "Patient deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//  5. Optionally — Update patient info (if needed)
exports.updatePatient = async (req, res) => {
    const { name, disease, description, contact } = req.body;

    try {
        const filepath = req.file?.path;

        const updateData = {
            name,
            disease,
            description,
            contact,
        };

        // If a new file was uploaded, add filepath to updateData
        if (filepath) {
            updateData.filepath = filepath;
        }

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            data: updatedPatient,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


exports.addPatient=async(req, res) =>{
    const { name, disease, description, contact, password } = req.body;
    try {
        const filepath=req.file?.path
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
            password: hashedPassword, // store hashed password
            filepath: filepath,
        });

        await newPatient.save();
        res.status(201).json({ success: true, message: "Patient registered", data: newPatient });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Server error" });
    }
}
