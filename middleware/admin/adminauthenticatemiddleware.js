const jwt = require('jsonwebtoken');
const User = require('../../model/user');

// General authentication middleware
exports.authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

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

// Admin-only middleware
exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Donor-only middleware
exports.requireDonor = (req, res, next) => {
    if (req.user.role !== 'donor' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Donor access required'
        });
    }
    next();
};

// Patient-only middleware
exports.requirePatient = (req, res, next) => {
    if (req.user.role !== 'patient' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Patient access required'
        });
    }
    next();
};

// Multiple role middleware
exports.requireRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};