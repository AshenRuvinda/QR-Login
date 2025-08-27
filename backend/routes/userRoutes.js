const express = require('express');
const {
  registerUser,
  getUsers,
  getUserById,
  suspendUser,
  removeUser,
} = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/roleMiddleware').authMiddleware;
const roleMiddleware = require('../middleware/roleMiddleware').roleMiddleware;

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['operator', 'hr', 'admin']), upload.single('profilePic'), registerUser);
router.get('/', authMiddleware, roleMiddleware(['hr', 'admin']), getUsers);
router.get('/:userId', authMiddleware, roleMiddleware(['hr', 'admin']), getUserById);
router.put('/:userId/suspend', authMiddleware, roleMiddleware(['hr', 'admin']), suspendUser);
router.delete('/:userId', authMiddleware, roleMiddleware(['hr', 'admin']), removeUser);

module.exports = router;