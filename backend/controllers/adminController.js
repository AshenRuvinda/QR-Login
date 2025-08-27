const bcrypt = require('bcryptjs');
const Staff = require('../models/Staff');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    console.log('Admin login attempt:', { username });
    
    // Find admin in Staff collection
    const admin = await Staff.findOne({ 
      username, 
      role: 'admin',
      isActive: true 
    });
    
    if (!admin) {
      console.log('Admin not found or inactive');
      return res.status(400).json({ 
        msg: 'Invalid credentials',
        success: false 
      });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ 
        msg: 'Invalid credentials',
        success: false 
      });
    }
    
    console.log('Admin login successful');
    res.json({
      success: true,
      staffId: admin.staffId,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      department: admin.department,
      role: admin.role,
      profilePic: admin.profilePic
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};