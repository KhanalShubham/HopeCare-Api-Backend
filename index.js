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

const socketAuthMiddleware = require('./middleware/socketAuthMiddleware');
const socketController = require('./controller/socketController');
const notificationService = require('./services/notificationServices'); // <--- NEW IMPORT

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // <--- CHANGE THIS
        methods: ['GET','POST']
    }
});

// --- Initialize Notification Service with Socket.IO instance ---
notificationService.setIoInstance(io); // <--- NEW LINE

// Connect DB
connectDB();

// Middlewares
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", userRoute);
app.use("/api/request", requestRoutes);
app.use("/api/auth/admin", adminRoute);
app.use("/api/admin/user", adminUserRoute);
app.use('/api/chat', chatRoutes); // Mount your chat routes
app.use('/api', uploadRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Server is running", success: true });
});

// Attach Socket.IO middleware
io.use(socketAuthMiddleware);

// WebSocket event handlers
socketController(io); // socketController now makes userSockets global

// Server Listen
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});