const Comment = require('../models/Comment');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const User = require('../models/User'); // Ensure User model is loaded

// @desc    Get comments for an item
// @route   GET /api/comments/:itemType/:itemId
// @access  Public (or Private depending on visibility settings, we'll allow public for now as requested "publicly available")
const getComments = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.params;
    
    const comments = await Comment.find({ itemType, itemId })
      .sort({ createdAt: 1 })
      .populate('userId', 'name role');

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment
// @route   POST /api/comments/:itemType/:itemId
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.params;
    const { text, parentId } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    // Verify item exists
    let item;
    if (itemType === 'LostItem') {
      item = await LostItem.findById(itemId);
    } else if (itemType === 'FoundItem') {
      item = await FoundItem.findById(itemId);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const comment = await Comment.create({
      itemId,
      itemType,
      userId: req.user._id,
      text,
      parentId: parentId || null
    });

    // Populate user for immediate display
    await comment.populate('userId', 'name role');

    // Notify Item Owner using service
    let notifResult = null;
    if (item.userId && item.userId.toString() !== req.user._id.toString()) {
      const notificationService = require('../services/notificationService');
      const ownerUser = await User.findById(item.userId);
      if (ownerUser) {
        notifResult = await notificationService.notifyNewComment({
          user: ownerUser,
          item: item,
          authorName: req.user.name
        });
      }
    }

    res.status(201).json({
      success: true,
      data: comment,
      notificationStatus: notifResult?.emailResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment
};
