const jwt = require("jsonwebtoken");

exports.authorizeToken = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = decoded;

        // Proceed to next middleware or route handler
        next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

exports.requireAdmin = (req, res, next) => {
    if (req.user?.role === 'admin') return next();

    return res.status(403).json({
        success: false,
        message: 'Admin access required'
    });
};


