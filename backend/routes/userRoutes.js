// routes/userRoutes.js
const express = require('express');
const {
  registerUser,
  registerStaff,
  getUsers,
  getStaff,
  getUserById,
  suspendUser,
  unsuspendUser,
  removeUser,
} = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');
const { authMiddleware, roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// User management (employees)
router.post('/register', authMiddleware, roleMiddleware(['operator', 'hr', 'admin']), upload.single('profilePic'), registerUser);
router.get('/users', authMiddleware, roleMiddleware(['hr', 'admin']), getUsers);
router.get('/user/:userId', authMiddleware, roleMiddleware(['hr', 'admin', 'operator']), getUserById);
router.put('/user/:userId/suspend', authMiddleware, roleMiddleware(['hr', 'admin']), suspendUser);
router.put('/user/:userId/unsuspend', authMiddleware, roleMiddleware(['hr', 'admin']), unsuspendUser);
router.delete('/user/:userId', authMiddleware, roleMiddleware(['hr', 'admin']), removeUser);

// Staff management (admin/hr/operator)
router.post('/staff/register', authMiddleware, roleMiddleware(['admin']), upload.single('profilePic'), registerStaff);
router.get('/staff', authMiddleware, roleMiddleware(['admin']), getStaff);

module.exports = router;