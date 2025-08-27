const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const OfficeMember = require('./models/OfficeMember');
const connectDB = require('./config/db');

const insertAdmin = async () => {
  try {
    await connectDB();
    const username = 'admin1';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = new OfficeMember({
      username,
      password: hashedPassword,
      role: 'admin',
    });
    
    await admin.save();
    console.log('Admin user inserted successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting admin:', err);
    mongoose.connection.close();
  }
};

insertAdmin();