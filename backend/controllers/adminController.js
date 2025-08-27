const bcrypt = require('bcryptjs');
const OfficeMember = require('../models/OfficeMember');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await OfficeMember.findOne({ username });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    res.json({
      username: admin.username,
      role: admin.role,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Admin-specific actions can be added here if needed, but most are in userController and attendanceController with role checks