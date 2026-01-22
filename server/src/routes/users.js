const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, altPhone, block, department } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate required fields based on role
    if (user.role === 'STUDENT') {
      if (block && !block.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Block cannot be empty for students'
        });
      }
      if (department && !department.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Department cannot be empty for students'
        });
      }
    }

    // Validate phone numbers if provided
    if (phone && phone.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be at least 10 digits'
      });
    }

    if (altPhone && altPhone.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Alternate phone number must be at least 10 digits'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (altPhone !== undefined) user.altPhone = altPhone;
    if (block !== undefined) user.block = block;
    if (department !== undefined) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

router.put('/me', requireAuth, updateProfile);

module.exports = router;
