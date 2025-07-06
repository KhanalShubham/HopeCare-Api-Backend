const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()
const connectDB = require('./config/db')
const userRoute = require('./routes/userRoute')
const adminUserRoute = require("./routes/admin/adminUserRoutes")
const cors = require('cors')
const requestRoutes = require("./routes/requestRoute")
const adminRoute = require("./routes/admin/adminRoute")
var bodyParser = require('body-parser')
const path = require("path")

const socketAuthMiddleware = require('./middleware/socketAuthMiddleware')
const socketController = require('./controller/socketController')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET','POST']
    }
})

// Connect DB
connectDB()

// Middlewares
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use("/api/auth", userRoute)
app.use("/api/request", requestRoutes)
app.use("/api/auth/admin", adminRoute)
app.use("/api/admin/user", adminUserRoute)

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Server is running", success: true })
})

// Attach Socket.IO middleware
io.use(socketAuthMiddleware)

// WebSocket event handlers
socketController(io)

// Server Listen
const PORT = process.env.PORT || 5050
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
