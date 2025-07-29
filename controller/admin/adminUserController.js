const User = require("../../model/user"); // Path might need adjustment
const bcrypt = require("bcrypt");

// GET ALL USERS (for Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        let filters = {};
        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        const skips = (page - 1) * limit;

        const users = await User.find(filters)
            .select("-password") 
            .sort({ createdAt: -1 })
            .skip(skips)
            .limit(Number(limit));

        const total = await User.countDocuments(filters);
        return res.status(200).json({
            success: true,
            message: "All users fetched successfully",
            data: users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET A SINGLE USER (for Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Get User By ID Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE A USER (for Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Consider deleting associated requests as well for data integrity
        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// UPDATE USER (for Admin)
exports.updateUser = async (req, res) => {
    const { name, disease, description, contact } = req.body;
    try {
        const filepath = req.file?.path;
        const updateData = { name, disease, description, contact };

        if (filepath) {
            updateData.filepath = filepath;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
    } catch (error) {
        console.error("Update User Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ADD USER (for Admin) - This is useful if an admin needs to create an account for someone.
exports.addUser = async (req, res) => {
    const { name, email, disease, description, contact, password } = req.body;
    try {
        const filepath = req.file?.path;
        const existing = await User.findOne({ $or: [{ email }, { contact }] });
        if (existing) {
            return res.status(400).json({ success: false, message: "User with this email or contact already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name, email, disease, description, contact,
            password: hashedPassword,
            filepath: filepath,
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User created by admin", data: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};