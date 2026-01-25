const nodemailer = require('nodemailer');

/**
 * Mailer Utility using Nodemailer
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD,
  },
});

/**
 * Send an email
 * @param {Object} options - { to, subject, text, html }
 * @returns {Promise}
 */
const sendMail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_APP_PASSWORD) {
      console.warn('Mail credentials missing, skipping email send.');
      return { success: false, error: 'Mail credentials missing' };
    }

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'AMC Lost & Found'}" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendMail };
