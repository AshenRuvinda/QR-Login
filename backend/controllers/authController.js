const bcrypt = require('bcryptjs');
const Staff = require('../models/Staff');

// Staff login (Admin/HR/Operator)
exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const staff = await Staff.findOne({ username });
    
    if (!staff || !staff.isActive) {
      return res.status(400).json({ 
        msg: 'Invalid credentials or account inactive',
        success: false 
      });
    }
    
    const isMatch = await bcrypt.compare(password, staff.password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        msg: 'Invalid credentials',
        success: false 
      });
    }
    
    res.json({
      success: true,
      staff: {
        staffId: staff.staffId,
        username: staff.username,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department,
        role: staff.role,
        profilePic: staff.profilePic
      }
    });
  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};