const express = require('express');
const { login } = require('../controllers/adminController');
const authMiddleware = require('../middleware/roleMiddleware').authMiddleware; // Assuming roleMiddleware has auth
const roleMiddleware = require('../middleware/roleMiddleware').roleMiddleware;

const router = express.Router();

router.post('/login', login);

// Admin protected routes would be added here, but since shared with user/attendance, protect there

module.exports = router;