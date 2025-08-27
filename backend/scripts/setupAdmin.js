const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Staff = require('../models/Staff');
const Counter = require('../models/Counter');
const connectDB = require('../config/db');

const setupAdmin = async () => {
  try {
    await connectDB();
    console.log('Setting up admin users...');

    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ username: 'admin1' });
    if (existingAdmin) {
      console.log('Admin already exists in Staff collection');
      console.log('Username: admin1');
      console.log('You can use this account to login');
      process.exit(0);
    }

    // Create admin in Staff collection
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Get or create counter for staffId
    const counter = await Counter.findByIdAndUpdate(
      'staffId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    const staffId = counter.seq === 1 ? 10001 : counter.seq + 10000;
    
    const adminStaff = new Staff({
      staffId: staffId,
      username: 'admin1',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'Administration',
      role: 'admin',
      password: hashedPassword,
      isActive: true
    });
    
    await adminStaff.save();
    console.log('✅ Admin created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Username: admin1');
    console.log('   Password: admin123');
    console.log('   Staff ID:', staffId);
    console.log('\n🚀 You can now login at /admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();