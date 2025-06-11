require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoute=require('./routes/userRoute');
const app = express();
const cors = require('cors');  // to manage request from frontend
let corsOption={
    origin:"*",
}
app.use(cors(corsOption));
connectDB();
app.use(express.json());
app.use("/api/auth", userRoute);

// app.get('/', (req, res) => {
//      return res.status(200).json({
//         message: "Server is running",
//         success: true
//     });
// });
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`
    );
});