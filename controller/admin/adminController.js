require("dotenv").config();
const jwt = require('jsonwebtoken');

exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log("Incoming admin login attempt:", username, password);
        console.log("ENV USERNAME:", process.env.ADMIN_USERNAME);
        console.log("ENV PASSWORD:", process.env.ADMIN_PASSWORD);

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                {username, role: "admin" }, // payload
                process.env.JWT_SECRET,     // secret key
                { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
            );  // or create jwt if you prefer
            return res.status(200).json({
                success: true,
                message: "Admin successfully logged in",
                token,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error during admin login",
            error: error.message,
        });
    }
};
