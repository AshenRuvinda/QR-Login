const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user || !['operator', 'hr'].includes(user.role)) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    res.json({
      userId: user.userId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      profilePic: user.profilePic,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};