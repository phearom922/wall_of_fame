// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Admin = require('../models/Admin');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const passwordHash = await bcrypt.hash('090790', 10);
    const admin = new Admin({ username: 'admin', passwordHash });
    await admin.save();
    console.log('Admin created');
    process.exit();
});
