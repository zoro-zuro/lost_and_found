const Interest = require('../models/Interest');
const FoundItem = require('../models/FoundItem');

// @desc    Create interest/claim request
// @route   POST /api/interests
// @access  Private
const createInterest = async (req, res, next) => {
  try {
    const { foundItemId, message } = req.body;

    // Validation
    if (!foundItemId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide found item ID and message'
      });
    }

    // Check if found item exists
    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    // Check if user already showed interest
    const existingInterest = await Interest.findOne({
      userId: req.user._id,
      foundItemId
    });

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'You have already shown interest in this item'
      });
    }

    const interest = await Interest.create({
      userId: req.user._id,
      foundItemId,
      message
    });

    // Populate user and found item details for response
    await interest.populate('userId', 'name email');
    await interest.populate('foundItemId', 'itemName category');

    // Create Notification using service
    const notificationService = require('../services/notificationService');
    const notifResult = await notificationService.notifyClaimCreated({
      user: req.user,
      item: interest.foundItemId
    });

    res.status(201).json({
      success: true,
      data: interest,
      message: 'Interest recorded successfully. ' + (notifResult.emailResult?.success ? 'Email confirmation sent.' : ''),
      notificationStatus: notifResult.emailResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's interests/claims
// @route   GET /api/interests/mine
// @access  Private
const getMyInterests = async (req, res, next) => {
  try {
    const interests = await Interest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('foundItemId', 'itemName category locationFound');

    res.status(200).json({
      success: true,
      data: interests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interests/claims for a specific found item
// @route   GET /api/interests/found/:foundItemId
// @access  Private
const getInterestsByFoundItem = async (req, res, next) => {
  try {
    const interests = await Interest.find({ foundItemId: req.params.foundItemId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name role department block email phone altPhone');

    res.status(200).json({
      success: true,
      data: interests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterest,
  getMyInterests,
  getInterestsByFoundItem
};
