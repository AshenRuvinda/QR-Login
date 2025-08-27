// routes/attendanceRoutes.js
const express = require('express');
const { 
  markAttendance, 
  getUserByQR, 
  getAttendanceLogs, 
  getTodayAttendance 
} = require('../controllers/attendanceController');
const { authMiddleware, roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Mark attendance (IN/OUT toggle)
router.post('/mark', authMiddleware, roleMiddleware(['operator', 'admin']), markAttendance);

// Get user info by QR scan (for preview before marking attendance)
router.get('/user/:userId', authMiddleware, roleMiddleware(['operator', 'admin']), getUserByQR);

// Get attendance logs with filters
router.get('/logs', authMiddleware, roleMiddleware(['hr', 'admin']), getAttendanceLogs);

// Get today's attendance summary
router.get('/today', authMiddleware, roleMiddleware(['hr', 'admin', 'operator']), getTodayAttendance);

module.exports = router;