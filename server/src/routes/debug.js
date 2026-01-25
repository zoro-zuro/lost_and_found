const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { sendMail } = require('../utils/mailer');

/**
 * @desc    Send a test email to the logged in admin
 * @route   POST /api/debug/send-test-email
 * @access  Private (Admin)
 */
router.post('/send-test-email', requireAuth, roleAuth('ADMIN'), async (req, res) => {
  try {
    const result = await sendMail({
      to: req.user.email,
      subject: 'AMC Lost & Found - Test Email',
      text: `Hello ${req.user.name},\n\nIf you are reading this, your Nodemailer configuration is working correctly!`,
      html: `<p>Hello <b>${req.user.name}</b>,</p><p>If you are reading this, your Nodemailer configuration is working correctly!</p>`
    });

    if (result.success) {
      res.status(200).json({ success: true, message: 'Test email sent successfully to ' + req.user.email });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send test email: ' + result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
