const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoute');
const adminRoute = require("./routes/admin/adminRoutes");
const cors = require('cors');

const app = express();

// CORS configuration
let corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", userRoute);
app.use("/api/admin", adminRoute);

// Optional base route
app.get('/', (req, res) => {
    return res.status(200).json({
        message: "Server is running",
        success: true
    });
});

// Server listen
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
