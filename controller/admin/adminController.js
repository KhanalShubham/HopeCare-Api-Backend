require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../model/user'); // Make sure this path is correct for your project structure

exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find the admin user in the database by their unique email
        const adminUser = await User.findOne({ email: username });

        // 2. Check if an admin with that email even exists
        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials (user not found)",
            });
        }

        // 3. Ensure the found user actually has the 'admin' role
        // THIS LINE WILL NOW WORK CORRECTLY
        if (adminUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not an admin user.",
            });
        }

        // 4. Compare the provided password with the HASHED password in the database
        const isMatch = await bcrypt.compare(password, adminUser.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials (password incorrect)",
            });
        }

        // 5. If password is correct, create a JWT with the REAL database ID
        const payload = {
            id: adminUser._id,
            name: adminUser.name,
            role: adminUser.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        // 6. Return the token and the REAL user data from the database
        return res.status(200).json({
            success: true,
            message: "Admin successfully logged in",
            token,
            user: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role
            }
        });

    } catch (error) {
        console.error("Server error during admin login:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during admin login",
            error: error.message,
        });
    }
};