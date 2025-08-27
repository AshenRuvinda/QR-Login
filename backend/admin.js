const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('./models/Staff');
const Counter = require('./models/Counter');
const connectDB = require('./config/db');

const setupAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.connection.close();
      return;
    }

    // Create counter for staffId if it doesn't exist
    const counter = await Counter.findByIdAndUpdate(
      'staffId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    const staffId = counter.seq + 10000; // Start from 10001
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new Staff({
      staffId,
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'IT',
      role: 'admin',
      password: hashedPassword,
      isActive: true
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    console.log(`Staff ID: ${staffId}`);
    console.log('Username: admin');
    console.log('Password: admin123');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error setting up admin:', err);
    mongoose.connection.close();
  }
};

setupAdmin();