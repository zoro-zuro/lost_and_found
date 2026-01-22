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

    res.status(201).json({
      success: true,
      data: interest,
      message: 'Interest recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterest
};
