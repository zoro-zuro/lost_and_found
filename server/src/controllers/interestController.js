const Interest = require('../models/Interest');
const FoundItem = require('../models/FoundItem');
const User = require('../models/User');

// @desc    Create interest/claim request
// @route   POST /api/interests
// @access  Private
const createInterest = async (req, res, next) => {
  try {
    const { foundItemId, lostItemId, message } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Support both foundItemId and lostItemId scenarios
    if (!foundItemId && !lostItemId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide found item ID or lost item ID'
      });
    }

    let item;
    let interestData;

    if (foundItemId) {
      // Original flow: User is interested in a found item
      item = await FoundItem.findById(foundItemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Found item not found'
        });
      }

      interestData = {
        userId: req.user._id,
        foundItemId,
        message
      };
    } else if (lostItemId) {
      // New flow: User claims they found a lost item
      const LostItem = require('../models/LostItem');
      item = await LostItem.findById(lostItemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Lost item not found'
        });
      }

      // Create a temporary found item record for the claim
      const FoundItem = require('../models/FoundItem');
      const tempFoundItem = await FoundItem.create({
        itemName: item.itemName,
        category: item.category,
        description: `Claim: ${message}`,
        locationFound: item.locationLost,
        dateFound: new Date(),
        reportedBy: req.user._id, // Fixed: use reportedBy instead of userId
        linkedLostItemId: lostItemId,
        publishStatus: 'PENDING',
        visibility: 'CAMPUS'
      });

      interestData = {
        userId: req.user._id,
        foundItemId: tempFoundItem._id,
        message
      };
    }

    // Check if user already showed interest
    const existingInterest = await Interest.findOne({
      userId: req.user._id,
      foundItemId: interestData.foundItemId
    });

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'You have already shown interest in this item'
      });
    }

    const interest = await Interest.create(interestData);

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

// @desc    Get interests/claims for a specific lost item
// @route   GET /api/interests/lost/:lostItemId
// @access  Private
const getInterestsByLostItem = async (req, res, next) => {
  try {
    const FoundItem = require('../models/FoundItem');
    
    // Find all found items linked to this lost item
    const foundItems = await FoundItem.find({ linkedLostItemId: req.params.lostItemId });
    const foundItemIds = foundItems.map(item => item._id);
    
    // Get all interests for these found items
    const interests = await Interest.find({ 
      foundItemId: { $in: foundItemIds } 
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name role department block email phone altPhone')
      .populate('foundItemId', 'itemName category')
      .populate('replies.replyBy', 'name role department block');

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
      .populate('userId', 'name role department block email phone altPhone')
      .populate('replies.replyBy', 'name role department block');

    res.status(200).json({
      success: true,
      data: interests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply to an interest/claim
// @route   POST /api/interests/:id/reply
// @access  Private
const addReplyToInterest = async (req, res, next) => {
  try {
    const { message } = req.body;
    const interestId = req.params.id;

    // Validation
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reply message'
      });
    }

    // Find the interest
    const interest = await Interest.findById(interestId);
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    // Add reply
    const reply = {
      message,
      replyBy: req.user._id,
      createdAt: new Date()
    };

    interest.replies.push(reply);
    await interest.save();

    // Populate and return updated interest
    const updatedInterest = await Interest.findById(interestId)
      .populate('userId', 'name role department block email phone altPhone')
      .populate('replies.replyBy', 'name role department block');

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: updatedInterest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterest,
  getMyInterests,
  getInterestsByLostItem,
  getInterestsByFoundItem,
  addReplyToInterest
};
