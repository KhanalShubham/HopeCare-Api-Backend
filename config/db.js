const mongoose = require('mongoose');

const CONNECTION_STRING = process.env.MONGODB_URI;

const connectDB = async () => {
    try{
        await mongoose.connect(CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectDB;

//this is db.js