const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, altPhone, block, department, emailNotificationsEnabled, notifyScope } = req.body;
    
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
    if (emailNotificationsEnabled !== undefined) user.emailNotificationsEnabled = emailNotificationsEnabled;
    if (notifyScope !== undefined) user.notifyScope = notifyScope;

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

const Notification = require('../models/Notification'); // Import Notification Model

// ... updateProfile logic ...

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/users/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/users/notifications
// @access  Private
const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public profile of any user (limited info)
// @route   GET /api/users/:id/profile
// @access  Private
const getPublicProfile = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id)
      .select('name role department block email phone altPhone institutionalId');
    
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Logic for privacy filtering:
    // If Admin/Staff, show everything.
    // If Student, only show Name/Role/Department/Block. Masks sensitive info.
    const isStaffOrAdmin = req.user.role === 'STAFF' || req.user.role === 'ADMIN';
    
    let profileData = targetUser.toObject();
    if (!isStaffOrAdmin) {
      delete profileData.email;
      delete profileData.phone;
      delete profileData.altPhone;
      delete profileData.registerNumber;
      delete profileData.staffId;
    }

    res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    next(error);
  }
};

router.put('/me', requireAuth, updateProfile);
router.get('/notifications', requireAuth, getNotifications);
router.patch('/notifications/:id/read', requireAuth, markNotificationRead);
router.delete('/notifications', requireAuth, clearAllNotifications);
router.get('/:id/profile', requireAuth, getPublicProfile);

module.exports = router;
