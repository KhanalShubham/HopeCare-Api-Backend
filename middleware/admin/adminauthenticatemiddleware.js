const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../../model/user');

dotenv.config();

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If admin token (no database user to look for)
        if (decoded.role === "admin") {
            req.user = { username: decoded.username, role: "admin" };
            return next();
        }

        // Otherwise for normal users
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

//  Require Admin
const requireAdmin = (req, res, next) => {
    if (req.user?.role === 'admin') return next();

    return res.status(403).json({
        success: false,
        message: 'Admin access required'
    });
};

//  Require Donor
const requireDonor = (req, res, next) => {
    if (req.user?.role === 'donor' || req.user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Donor access required'
    });
};

//  Require Patient
const requirePatient = (req, res, next) => {
    if (req.user?.role === 'patient' || req.user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Patient access required'
    });
};


module.exports = {
    authenticateToken,
    requireAdmin,
    requireDonor,
    requirePatient
};
