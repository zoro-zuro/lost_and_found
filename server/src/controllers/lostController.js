const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

// @desc    Create lost item
// @route   POST /api/lost
// @access  Private
const createLostItem = async (req, res, next) => {
  try {
    const {
      itemName,
      category,
      dateLost,
      locationLost,
      description,
      color,
      brand,
      uniqueMark,
      contactPhone
    } = req.body;

    // Validation
    if (!itemName || !category || !dateLost || !locationLost || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters long'
      });
    }

    const lostItem = await LostItem.create({
      userId: req.user._id,
      itemName,
      category,
      dateLost,
      locationLost,
      description,
      color,
      brand,
      uniqueMark,
      contactPhone
    });

    res.status(201).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's lost items
// @route   GET /api/lost/mine
// @access  Private
const getMyLostItems = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;

    const lostItems = await LostItem.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: lostItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get potential matches for lost item
// @route   GET /api/lost/:id/matches
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }

    // Check if user owns this lost item
    if (lostItem.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view matches for this item'
      });
    }

    // Simple matching logic: same category AND (itemName contains OR description contains)
    // Also prioritize recent found items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const matches = await FoundItem.find({
      category: lostItem.category,
      $or: [
        { itemName: { $regex: lostItem.itemName, $options: 'i' } },
        { description: { $regex: lostItem.description.substring(0, 100), $options: 'i' } }
      ],
      dateFound: { $gte: thirtyDaysAgo }
    })
    .sort({ dateFound: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: matches,
      message: `Found ${matches.length} potential matches`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLostItem,
  getMyLostItems,
  getMatches
};
