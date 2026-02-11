const express = require('express');
const { register, login, getMe, sendVerification, verifyEmail } = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/send-verification', requireAuth, sendVerification);
router.post('/verify-email', verifyEmail);

module.exports = router;
