const FoundItem = require('../models/FoundItem');

// @desc    Get all found items with pagination and filters
// @route   GET /api/found
// @access  Private
const getFoundItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const location = req.query.location || '';

    // Build query
    let query = {};

    // Search by itemName or description
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by location
    if (location) {
      query.locationFound = { $regex: location, $options: 'i' };
    }

    const foundItems = await FoundItem.find(query)
      .sort({ dateFound: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await FoundItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: foundItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get found item by ID
// @route   GET /api/found/:id
// @access  Private
const getFoundItemById = async (req, res, next) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: foundItem
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoundItems,
  getFoundItemById
};
