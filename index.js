// index.js (Modified)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const userRoute = require('./routes/userRoute');
const adminUserRoute = require("./routes/admin/adminUserRoutes");
const cors = require('cors');
const requestRoutes = require("./routes/requestRoute");
const adminRoute = require("./routes/admin/adminRoute");
const chatRoutes = require('./routes/chatRoutes'); // Adjust path
const path = require("path");
const uploadRoutes = require('./routes/uploadRoutes')
const notificationRoutes = require('./routes/notificationRoutes');

const socketAuthMiddleware = require('./middleware/socketAuthMiddleware');
const socketController = require('./controller/socketController');
const notificationService = require('./services/notificationServices');
const publicCampaignsRoute = require('./routes/publicCampaigns');
const donationRoutes = require('./routes/donationRoutes');

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", //
        methods: ['GET','POST','PUT']
    }
});


notificationService.setIoInstance(io);

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", userRoute);
app.use("/api/request", requestRoutes);
app.use("/api/auth/admin", adminRoute);
app.use("/api/admin/user", adminUserRoute);
app.use('/api/chat', chatRoutes);
app.use('/api', uploadRoutes);
app.use('/api/campaigns', publicCampaignsRoute);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);


app.get('/', (req, res) => {
    return res.status(200).json({ message: "Server is running", success: true });
});

// Attach Socket.IO middleware
io.use(socketAuthMiddleware);

// WebSocket event handlers
socketController(io); // socketController now makes userSockets global

module.exports = { app, server };