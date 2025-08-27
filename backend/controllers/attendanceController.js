const User = require('../models/User');

exports.markAttendance = async (req, res) => {
  const { userId } = req.body;
  const markedBy = req.user.userId || req.user.username; // Depending on role
  try {
    const user = await User.findOne({ userId });
    if (!user || user.isSuspended) return res.status(400).json({ msg: 'Invalid user' });
    user.attendance.push({ timestamp: new Date(), markedBy });
    await user.save();
    res.json({ msg: 'Attendance marked' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAttendanceLogs = async (req, res) => {
  const { userId, name, department, date } = req.query;
  try {
    let match = {};
    if (userId) match.userId = parseInt(userId);
    if (department) match.department = department;
    if (name) match.$or = [{ firstName: { $regex: name, $options: 'i' } }, { lastName: { $regex: name, $options: 'i' } }];
    
    const pipeline = [
      { $match: match },
      { $unwind: '$attendance' },
    ];
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      pipeline.push({ $match: { 'attendance.timestamp': { $gte: start, $lt: end } } });
    }
    pipeline.push({
      $project: {
        userId: 1,
        name: { $concat: ['$firstName', ' ', '$lastName'] },
        department: 1,
        timestamp: '$attendance.timestamp',
        markedBy: '$attendance.markedBy',
      },
    });
    pipeline.push({ $sort: { timestamp: -1 } });

    const logs = await User.aggregate(pipeline);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};