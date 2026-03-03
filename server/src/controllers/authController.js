const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Email validation helper
const validateAMCEmail = (email) => {
  // AMC college email format validation
  const amcEmailRegex = /^[a-z0-9]+@americancollege\.edu\.in$/i;
  return amcEmailRegex.test(email);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      registerNumber,
      block,
      department,
      staffId,
      phone,
      altPhone,
      staffSecret
    } = req.body;

    // Validate AMC email format
    if (!validateAMCEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email must be a valid AMC college email (e.g., 23bit15@americancollege.edu.in)'
      });
    }

    // Validate required fields based on role
    if (role === 'STUDENT') {
      if (!registerNumber || !block || !department) {
        return res.status(400).json({
          success: false,
          message: 'Students must provide register number, block and department'
        });
      }
    } else if (role === 'STAFF' || role === 'ADMIN') {
      if (!staffId) {
        return res.status(400).json({
          success: false,
          message: 'Staff/Admin must provide staff ID'
        });
      }

      // Verify staff registration secret
      const expectedSecret = process.env.STAFF_REGISTER_SECRET || 'amc_staff_2024';
      if (staffSecret !== expectedSecret) {
        return res.status(403).json({
          success: false,
          message: 'Invalid staff registration code. Please contact administrator.'
        });
      }
    }

    // Generate the internal unique code for checking
    const userCode = role === 'STUDENT'
      ? `STD-${registerNumber.toUpperCase()}`
      : `EMP-${staffId.toUpperCase()}`;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { userCode }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'identification number';
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${field}`
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      phone,
      altPhone,
      department,
      institutionalId: role === 'STUDENT' ? registerNumber : staffId,
      block: role === 'STUDENT' ? block : undefined
    };

    const user = await User.create(userData);

    // Auto-approve Staff/Admin if registration was successful (secret was already verified above)
    if (role === 'STAFF' || role === 'ADMIN') {
      user.isApproved = true;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: role === 'STUDENT'
        ? 'Account created successfully!'
        : 'Account created! Awaiting admin approval.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Validate AMC email format
    if (!validateAMCEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email must be a valid AMC college email (e.g., 23bit15@americancollege.edu.in)'
      });
    }

    // Check for user - explicitly select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is approved (for STAFF/ADMIN)
    // if ((user.role === 'STAFF' || user.role === 'ADMIN') && !user.isApproved) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Your account is pending admin approval. Please contact administrator.'
    //   });
    // }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    // Prevent caching of auth endpoints
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Prevent caching of auth endpoints
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send verification email
// @route   POST /api/auth/send-verification
// @access  Private
const sendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?verify=${verificationToken}`;

    // Send email
    const emailResult = await sendMail({
      to: user.email,
      subject: 'Verify Your Email - AMC Lost & Found',
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Email - AMC Lost & Found</title>
      <style>
        /* Basic reset */
        body {
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        table {
          border-spacing: 0;
          border-collapse: collapse;
        }
        img {
          border: 0;
          line-height: 100%;
          text-decoration: none;
        }
        .wrapper {
          width: 100%;
          background-color: #f3f4f6;
          padding: 24px 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .header {
          padding: 28px 24px;
          background: linear-gradient(135deg, #fee2e2, #e0f2fe);
          text-align: left;
        }
        .header-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #111827;
        }
        .header-subtitle {
          margin: 6px 0 0 0;
          font-size: 14px;
          color: #4b5563;
          font-weight: 600;
        }
        .content {
          padding: 24px 24px 28px 24px;
        }
        .h2 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        .p {
          margin: 0 0 12px 0;
          font-size: 14px;
          line-height: 1.6;
          color: #4b5563;
        }
        .reason-box {
          margin: 18px 0 22px 0;
          padding: 14px 14px;
          border-radius: 10px;
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
        }
        .reason-title {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 700;
          color: #92400e;
        }
        .reason-text {
          margin: 0;
          font-size: 13px;
          color: #92400e;
          line-height: 1.5;
        }
        .button-wrapper {
          text-align: center;
          margin: 24px 0 8px 0;
        }
        .btn {
          display: inline-block;
          padding: 14px 32px;
          border-radius: 999px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #ffffff !important;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }
        .btn:link, .btn:visited, .btn:hover, .btn:active {
          color: #ffffff;
          text-decoration: none;
        }
        .fallback {
          margin-top: 18px;
          padding: 12px 12px;
          border-radius: 8px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #2563eb;
          word-break: break-all;
        }
        .note-box {
          margin-top: 18px;
          padding: 10px 12px;
          border-radius: 8px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
        }
        .note-text {
          margin: 0;
          font-size: 12px;
          color: #b91c1c;
        }
        .footer {
          padding: 18px 24px 20px 24px;
          text-align: center;
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text-main {
          margin: 0 0 4px 0;
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }
        .footer-text-sub {
          margin: 0;
          font-size: 11px;
          color: #9ca3af;
        }
        @media only screen and (max-width: 600px) {
          .container {
            border-radius: 0;
          }
          .header, .content, .footer {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table width="100%" role="presentation">
          <tr>
            <td align="center">
              <table class="container" role="presentation">
                <!-- Header -->
                <tr>
                  <td class="header">
                    <p class="header-title">AMC Lost &amp; Found</p>
                    <p class="header-subtitle">Verify your email to get started</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td class="content">
                    <p class="h2">Hello ${user.name},</p>
                    <p class="p">
                      Welcome to AMC Lost &amp; Found. Verify your college email to unlock your verified student badge and use all features of the platform.
                    </p>

                    <div class="reason-box">
                      <p class="reason-title">Why do you need to verify?</p>
                      <p class="reason-text">
                        To keep reports authentic and tied to real AMC students, only verified users can create lost or found reports, comment on items, and contact other students.
                      </p>
                      <p class="reason-text" style="margin-top: 6px;">
                        Until you verify, your account will be in <strong>unverified</strong> mode and you will not be able to report lost items or claim found items.
                      </p>
                    </div>

                    <div class="button-wrapper">
                      <a href="${verificationUrl}" class="btn">
                        Verify email address
                      </a>
                    </div>

                    <div class="note-box">
                      <p class="note-text">
                        This link is valid for 24 hours. If you did not sign up for AMC Lost &amp; Found, you can safely ignore this email.
                      </p>
                    </div>

                    <p class="p" style="margin-top: 18px; margin-bottom: 6px; font-size: 12px;">
                      If the button above does not work, copy and paste this link into your browser:
                    </p>
                    <div class="fallback">
                      ${verificationUrl}
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td class="footer">
                    <p class="footer-text-main">
                      © 2024 AMC Lost &amp; Found. All rights reserved.
                    </p>
                    <p class="footer-text-sub">
                      American College of Engineering &amp; Technology
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `,
      text: `
Hello ${user.name},

Welcome to AMC Lost & Found.

To keep reports authentic and tied to real AMC students, only verified users can create lost/found reports, comment, or contact other students. Until you verify, your account will stay unverified and you will not be able to report lost items or claim found items.

To verify your email, open this link in your browser:
${verificationUrl}

This link will expire in 24 hours. If you didn't request this verification, you can safely ignore this email.

© 2024 AMC Lost & Found. All rights reserved.
  `,
    });


    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  sendVerification,
  verifyEmail
};
