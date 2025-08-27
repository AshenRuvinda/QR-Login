const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Counter = require('../models/Counter');

exports.registerUser = async (req, res) => {
  const { firstName, lastName, department, role = 'employee', password } = req.body;
  const profilePic = req.file ? `/uploads/profile_pics/${req.file.filename}` : null;
  try {
    const counter = await Counter.findByIdAndUpdate(
      'userId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const userId = counter.seq + 20000; // Start from 20001
    let hashedPassword = null;
    if (['operator', 'hr'].includes(role) && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const user = new User({
      userId,
      firstName,
      lastName,
      department,
      role,
      profilePic,
      password: hashedPassword,
      isSuspended: false,
    });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { isSuspended: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ userId: req.params.userId });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'User removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};