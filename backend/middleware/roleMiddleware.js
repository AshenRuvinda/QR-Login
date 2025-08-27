const bcrypt = require('bcryptjs');
const Staff = require('../models/Staff');

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      msg: 'No authorization header or invalid format',
      success: false 
    });
  }
  
  const base64 = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  
  try {
    // Check if it's a staff member
    const staff = await Staff.findOne({ username });
    
    if (staff && staff.isActive && await bcrypt.compare(password, staff.password)) {
      req.user = { 
        staffId: staff.staffId,
        username: staff.username, 
        role: staff.role,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department
      };
      return next();
    }
    
    return res.status(401).json({ 
      msg: 'Invalid credentials',
      success: false 
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ 
      msg: 'Access denied - insufficient permissions',
      success: false,
      requiredRoles: roles,
      userRole: req.user?.role 
    });
  }
  next();
};