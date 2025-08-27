const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Counter = require('../models/Counter');

// Register a new user (employee)
exports.registerUser = async (req, res) => {
  const { firstName, lastName, department } = req.body;
  const profilePic = req.file ? `/uploads/profile_pics/${req.file.filename}` : null;
  
  try {
    const counter = await Counter.findByIdAndUpdate(
      'userId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    const userId = counter.seq + 20000; // Start from 20001
    
    const user = new User({
      userId,
      firstName,
      lastName,
      department,
      profilePic,
      isSuspended: false,
      currentStatus: 'OUT'
    });
    
    await user.save();
    
    res.json({
      success: true,
      msg: 'User registered successfully',
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        profilePic: user.profilePic,
        currentStatus: user.currentStatus
      }
    });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

// Register a new staff member (Admin/HR/Operator)
exports.registerStaff = async (req, res) => {
  const { firstName, lastName, department, role, username, password } = req.body;
  const profilePic = req.file ? `/uploads/profile_pics/${req.file.filename}` : null;
  
  try {
    // Check if username already exists
    const existingStaff = await Staff.findOne({ username });
    if (existingStaff) {
      return res.status(400).json({ 
        msg: 'Username already exists',
        success: false 
      });
    }
    
    const counter = await Counter.findByIdAndUpdate(
      'staffId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    const staffId = counter.seq + 10000; // Start from 10001
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const staff = new Staff({
      staffId,
      username,
      firstName,
      lastName,
      department,
      role,
      password: hashedPassword,
      profilePic,
      isActive: true
    });
    
    await staff.save();
    
    res.json({
      success: true,
      msg: 'Staff member registered successfully',
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
    console.error('Staff registration error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

// Fixed: Get all users with proper response format
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ userId: 1 });
    res.json({
      success: true,
      users: users,
      total: users.length
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({}).select('-password').sort({ staffId: 1 });
    res.json({
      success: true,
      staff: staff,
      total: staff.length
    });
  } catch (err) {
    console.error('Get staff error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: parseInt(req.params.userId) });
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found',
        success: false 
      });
    }
    
    res.json({
      success: true,
      user: user
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: parseInt(req.params.userId) },
      { isSuspended: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found',
        success: false 
      });
    }
    
    res.json({
      success: true,
      msg: 'User suspended successfully',
      user: user
    });
  } catch (err) {
    console.error('Suspend user error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.unsuspendUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: parseInt(req.params.userId) },
      { isSuspended: false },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found',
        success: false 
      });
    }
    
    res.json({
      success: true,
      msg: 'User unsuspended successfully',
      user: user
    });
  } catch (err) {
    console.error('Unsuspend user error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ 
      userId: parseInt(req.params.userId) 
    });
    
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found',
        success: false 
      });
    }
    
    res.json({
      success: true,
      msg: 'User removed successfully'
    });
  } catch (err) {
    console.error('Remove user error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};