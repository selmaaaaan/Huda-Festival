require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await connectDB();

        const userName = process.env.SEED_ADMIN_USERNAME || 'admin';
        const password = process.env.SEED_ADMIN_PASSWORD || 'admin';

        const userExist = await User.findOne({ userName });
        if (userExist) {
            userExist.password = password; // Will be hashed by pre-save hook
            await userExist.save();
            console.log(`[Seed] Admin user '${userName}' updated with new password.`);
        } else {
            await User.create({
                userName,
                password,
                role: 'admin'
            });
            console.log(`[Seed] Success! Created admin user '${userName}'.`);
        }
    } catch (error) {
        console.error(`[Seed] Error creating admin user: ${error.message}`);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

seedAdmin();
