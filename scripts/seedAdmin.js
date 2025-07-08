// File: scripts/seedAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables from the root .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// IMPORTANT: Adjust the path to your User model if necessary
const User = require('../model/user');

const seedAdmin = async () => {
    // Check for required environment variables
    const mongoUri = process.env.MONGODB_URI;
    const adminEmail = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!mongoUri || !adminEmail || !adminPassword) {
        console.error('Error: MONGODB_URI, ADMIN_USERNAME, and ADMIN_PASSWORD must be set in your .env file.');
        process.exit(1); // Exit with a failure code
    }

    // Connect to the database
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully for seeding.');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }

    try {
        // 1. Check if the admin user already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`ℹ️  Admin user with email "${adminEmail}" already exists.`);
            // Optional: You could update the existing admin here if you wanted.
            // For now, we'll just report it and exit.
        } else {
            // 2. If admin does not exist, create it
            console.log(`⏳ Admin user not found. Creating a new admin with email "${adminEmail}"...`);

            // HASH THE PASSWORD - This is crucial for security
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const newAdmin = new User({
                name: 'Admin', // Or any default name you prefer
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                contact: '0000000000',  // Add this line
                disease: 'N/A'// Make sure your User schema has a 'role' field
                // Add any other default fields your User model requires
            });

            await newAdmin.save();
            console.log('✅ Admin user created successfully!');
            console.log('--- New Admin Details ---');
            console.log(`   Name: ${newAdmin.name}`);
            console.log(`   Email: ${newAdmin.email}`);
            console.log(`   Role: ${newAdmin.role}`);
            console.log(`   Database ID: ${newAdmin._id}`);
            console.log('-------------------------');
            console.log('IMPORTANT: You may want to add this ID to your .env file as ADMIN_ID for easy access.');
        }
    } catch (error) {
        console.error('❌ Error during admin seeding process:', error);
    } finally {
        // 3. Always disconnect from the database when the script is done
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected.');
    }
};

// Run the seed function
seedAdmin();