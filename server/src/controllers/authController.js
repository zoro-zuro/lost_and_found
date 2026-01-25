const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
          message: 'Students must provide register number, block, and department'
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
      institutionalId: role === 'STUDENT' ? registerNumber : staffId,
      block: role === 'STUDENT' ? block : undefined,
      department: department || ''
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

module.exports = {
  register,
  login,
  getMe
};
