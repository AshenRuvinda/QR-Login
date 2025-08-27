const User = require('../models/User');
const Staff = require('../models/Staff');

exports.markAttendance = async (req, res) => {
  const { userId } = req.body;
  const markedBy = req.user.username || req.user.staffId; // Staff member marking attendance
  
  try {
    const user = await User.findOne({ userId: parseInt(userId) });
    
    if (!user || user.isSuspended) {
      return res.status(400).json({ 
        msg: 'Invalid user or user is suspended',
        success: false 
      });
    }

    // Toggle status: If OUT, mark as IN; If IN, mark as OUT
    const newStatus = user.currentStatus === 'OUT' ? 'IN' : 'OUT';
    
    // Add attendance record
    user.attendance.push({
      timestamp: new Date(),
      status: newStatus,
      markedBy: markedBy
    });
    
    // Update current status
    user.currentStatus = newStatus;
    
    await user.save();
    
    res.json({
      success: true,
      msg: `Attendance marked as ${newStatus}`,
      user: {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        department: user.department,
        profilePic: user.profilePic,
        currentStatus: user.currentStatus,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error('Attendance marking error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.getUserByQR = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findOne({ userId: parseInt(userId) });
    
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found',
        success: false 
      });
    }

    if (user.isSuspended) {
      return res.status(400).json({ 
        msg: 'User is suspended',
        success: false 
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        department: user.department,
        profilePic: user.profilePic,
        currentStatus: user.currentStatus
      }
    });
  } catch (err) {
    console.error('User lookup error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.getAttendanceLogs = async (req, res) => {
  const { userId, name, department, date, status } = req.query;
  
  try {
    let match = {};
    if (userId) match.userId = parseInt(userId);
    if (department) match.department = { $regex: department, $options: 'i' };
    if (name) {
      match.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }
    
    const pipeline = [
      { $match: match },
      { $unwind: '$attendance' },
    ];
    
    // Date filter
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      pipeline.push({
        $match: { 
          'attendance.timestamp': { $gte: start, $lt: end } 
        }
      });
    }
    
    // Status filter
    if (status && ['IN', 'OUT'].includes(status.toUpperCase())) {
      pipeline.push({
        $match: { 
          'attendance.status': status.toUpperCase() 
        }
      });
    }
    
    pipeline.push({
      $project: {
        userId: 1,
        name: { $concat: ['$firstName', ' ', '$lastName'] },
        department: 1,
        profilePic: 1,
        currentStatus: 1,
        timestamp: '$attendance.timestamp',
        status: '$attendance.status',
        markedBy: '$attendance.markedBy',
      },
    });
    
    pipeline.push({ $sort: { timestamp: -1 } });

    const logs = await User.aggregate(pipeline);
    
    res.json({
      success: true,
      logs: logs,
      total: logs.length
    });
  } catch (err) {
    console.error('Attendance logs error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pipeline = [
      { $unwind: '$attendance' },
      {
        $match: {
          'attendance.timestamp': { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$userId',
          userId: { $first: '$userId' },
          name: { $first: { $concat: ['$firstName', ' ', '$lastName'] } },
          department: { $first: '$department' },
          profilePic: { $first: '$profilePic' },
          currentStatus: { $first: '$currentStatus' },
          todayRecords: { $push: '$attendance' }
        }
      },
      { $sort: { userId: 1 } }
    ];

    const todayAttendance = await User.aggregate(pipeline);
    
    const stats = {
      totalPresent: todayAttendance.length,
      currentlyIn: await User.countDocuments({ currentStatus: 'IN' }),
      currentlyOut: await User.countDocuments({ currentStatus: 'OUT' })
    };

    res.json({
      success: true,
      stats: stats,
      attendance: todayAttendance
    });
  } catch (err) {
    console.error('Today attendance error:', err);
    res.status(500).json({ 
      msg: 'Server error',
      success: false 
    });
  }
};