const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../model/user');

const seedAdmin = async () => {
    const mongoUri = process.env.MONGODB_URI;
    const adminEmail = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminId = process.env.ADMIN_ID;

    if (!mongoUri || !adminEmail || !adminPassword || !adminId) {
        console.error('Error: MONGODB_URI, ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_ID must be set in your .env file.');
        process.exit(1);
    }

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
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`ℹ️  Admin user with email "${adminEmail}" already exists.`);
        } else {
            console.log(`⏳ Creating a new admin with custom _id "${adminId}"...`);

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const newAdmin = new User({
                _id: adminId,   // 👈 this line assigns your custom _id
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                contact: '0000000000',
                disease: 'N/A'
            });

            await newAdmin.save();
            console.log('✅ Admin user created successfully!');
            console.log('--- New Admin Details ---');
            console.log(`   _id: ${newAdmin._id}`);
            console.log(`   Name: ${newAdmin.name}`);
            console.log(`   Email: ${newAdmin.email}`);
            console.log(`   Role: ${newAdmin.role}`);
            console.log('-------------------------');
        }
    } catch (error) {
        console.error('❌ Error during admin seeding process:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected.');
    }
};

seedAdmin();
