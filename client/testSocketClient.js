const { io } = require("socket.io-client")

// Replace this with your real JWT token (copy it after login)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWJmNjlkZTMzOTA0ODMwZDY2MjI5ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUxMjY0MzE5LCJleHAiOjE3NTEzNTA3MTl9.IkqbB5BXISYZwiIa8TLlDTs4DzfHokEDsRQsbDmWqus"

// Connect to your backend WebSocket server with token
const socket = io("ws://localhost:5050", {
    auth: {
        token: token
    }
})

// On successful connection
socket.on("connect", () => {
    console.log("Connected with ID:", socket.id)

    // Test event: send a chat message
    socket.emit("message", "Hello admin, this is a test message!")

    // Test event: send a newRequest event
    socket.emit("newRequest", { content: "This is a new test request" })
})

// Listen to adminNotification event
socket.on("adminNotification", (data) => {
    console.log("📥 Admin Notification Received:", data)
})

// Listen to userApprovalNotification event
socket.on("userApprovalNotification", (data) => {
    console.log("🎉 User Approval Notification:", data)
})

// Listen to any general message event
socket.on("message", (data) => {
    console.log("📥 Message Received:", data)
})

// On disconnect
socket.on("disconnect", () => {
    console.log("❌ Disconnected from server")
})

// On error
socket.on("connect_error", (err) => {
    console.error("❌ Connection Error:", err.message)
})
