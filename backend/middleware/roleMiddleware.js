const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OfficeMember = require('../models/OfficeMember');

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ msg: 'No authorization header' });
  }
  const base64 = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  try {
    // Check admin first
    const admin = await OfficeMember.findOne({ username });
    if (admin && await bcrypt.compare(password, admin.password)) {
      req.user = { username: admin.username, role: 'admin' };
      return next();
    }
    // Check user (operator/hr)
    const user = await User.findOne({ userId: parseInt(username) });
    if (user && ['operator', 'hr'].includes(user.role) && await bcrypt.compare(password, user.password)) {
      req.user = { userId: user.userId, role: user.role };
      return next();
    }
    res.status(401).json({ msg: 'Unauthorized' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ msg: 'Access denied' });
  }
  next();
};