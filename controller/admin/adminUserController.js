const User=require("../../model/user")
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query
        let filters = {}
        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: "i" } }
            ]
        }
        const skips = (page - 1) * limit;

        const patients = await User.find(filters)
            .skip(skips)
            .limit(Number(limit))// optional for clarity
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filters)
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
exports.getUserById = async (req, res) => {
    try {
        const patient = await User.findById(req.params.id)
        if (!patient) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: patient });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//  4. Delete a patient
exports.deleteUser = async (req, res) => {
    try {
        const patient = await User.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//  5. Optionally — Update patient info (if needed)
exports.updateUser = async (req, res) => {
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

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


exports.addUser=async(req, res) =>{
    const { name, disease, description, contact, password } = req.body;
    try {
        const filepath=req.file?.path
        const existing = await User.findOne({ contact:contact });
        if (existing) {
            return res.status(400).json({ success: false, message: "User with this contact already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            disease,
            description,
            contact,
            password: hashedPassword, // store hashed password
            filepath: filepath,
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User registered", data: newUser });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Server error" });
    }
}
