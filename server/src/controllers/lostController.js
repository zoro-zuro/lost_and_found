const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const User = require('../models/User');

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
      contactPhone,
      visibility,
      notifyRequested
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
      contactPhone,
      visibility: visibility || 'CAMPUS',
      notifyRequested: notifyRequested || false
    });

    // Populate user details
    await lostItem.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      data: lostItem,
      message: 'Lost item reported successfully. Your report is now under review.'
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
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;

    const totalCount = await LostItem.countDocuments({ userId: req.user._id });
    
    const lostItems = await LostItem.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: lostItems,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lost item (owner only)
// @route   GET /api/lost/:id
// @access  Private
const getLostItem = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id)
      .populate('userId', 'name email role registerNumber staffId');
    
    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }

    // Check if user owns this lost item or is admin
    if (lostItem.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this item'
      });
    }

    res.status(200).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby lost items (Help Others feature)
// @route   GET /api/lost/nearby
// @access  Private
const getNearbyLostItems = async (req, res, next) => {
  try {
    const scope = req.query.scope || 'block'; // block | all
    const category = req.query.category;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;

    // Get current user's block
    const currentUser = await User.findById(req.user._id);
    
    // Build query
    const query = {
      publishStatus: 'PUBLISHED',
      visibility: 'CAMPUS',
      reviewStatus: 'APPROVED',
      status: 'OPEN',
      userId: { $ne: req.user._id } // Don't show user's own items
    };

    // Filter by block if scope is 'block' and user has a block
    if (scope === 'block' && currentUser.block) {
      // We need to populate userId to check block, but we'll do it differently
      // Instead, we'll get all user IDs with matching block first
      const usersInBlock = await User.find({ block: currentUser.block }).select('_id');
      const userIds = usersInBlock.map(u => u._id);
      query.userId = { $in: userIds };
    }

    if (category) {
      query.category = category;
    }

    const totalCount = await LostItem.countDocuments(query);

    const lostItems = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('-contactPhone -uniqueMark') // Don't expose sensitive details
      .populate('userId', 'name block department');

    res.status(200).json({
      success: true,
      data: lostItems,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
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
  getLostItem,
  getNearbyLostItems,
  getMatches
};
