// middleware/socketAuthMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Unauthorized: No token provided"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;

        // --- ADD THIS CONSOLE.LOG TO VERIFY YOUR JWT PAYLOAD ---
        console.log("Socket authenticated. Decoded user (socket.user):", socket.user);
        // Look at the output of this. What properties does it have?
        // E.g., { id: '...', role: 'user', email: '...', username: '...' }
        // If 'username' or 'name' is missing, that's why it's 'Anonymous'.

        next();
    } catch (error) {
        console.error("Socket Auth Error:", error.message);
        return next(new Error("Unauthorized: Invalid or expired token"));
    }
};