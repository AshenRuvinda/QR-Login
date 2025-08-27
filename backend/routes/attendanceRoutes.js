const express = require('express');
const { markAttendance, getAttendanceLogs } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/roleMiddleware').authMiddleware;
const roleMiddleware = require('../middleware/roleMiddleware').roleMiddleware;

const router = express.Router();

router.post('/mark', authMiddleware, roleMiddleware(['operator']), markAttendance);
router.get('/logs', authMiddleware, roleMiddleware(['hr', 'admin']), getAttendanceLogs);

module.exports = router;