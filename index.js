const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoute');
const adminUserRoute = require("./routes/admin/adminUserRoutes");
const cors = require('cors');
const requestRoutes=require("./routes/requestRoute")
const adminRoute=require("./routes/admin/adminRoute")
var bodyParser = require('body-parser')
const path=require("path")




const app = express();

// CORS configuration
let corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json()); // for JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", userRoute);
app.use("/api/request", requestRoutes)
app.use("/api/auth/admin", adminRoute)
app.use("/api/admin/user", adminUserRoute)

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
