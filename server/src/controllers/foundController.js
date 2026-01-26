const FoundItem = require('../models/FoundItem');
const User = require('../models/User');
const { getImageUrl } = require('../utils/upload');

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



// @desc    Create found item
// @route   POST /api/found
// @access  Private
const createFoundItem = async (req, res, next) => {
  try {
    console.log('Create Found Item Request Body:', req.body);
    console.log('Uploaded file:', req.file);
    
    const {
      itemName,
      category,
      dateFound,
      locationFound,
      description,
      lostId // Optional: ID of the lost item this matches
    } = req.body;

    // Validation
    if (!itemName || !category || !dateFound || !locationFound || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Handle image URL if image was uploaded
    let imageUrl = null;
    if (req.file) {
      // For now, we'll skip image storage in serverless
      // In production, you'd upload to cloud storage like Cloudinary, AWS S3, etc.
      imageUrl = 'image-uploaded'; // Placeholder
    }

    const foundData = {
      itemName,
      category,
      dateFound,
      locationFound,
      description,
      imageUrl
    };

    if (lostId) {
      foundData.linkedLostItemId = lostId;
    }

    const foundItem = await FoundItem.create(foundData);

    // If linked to a lost item, trigger Match Logic
    if (lostId) {
      const LostItem = require('../models/LostItem');
      const Notification = require('../models/Notification');
      const Comment = require('../models/Comment');

      const lostItem = await LostItem.findById(lostId);
      
      if (lostItem) {
        // Update Lost Item Status
        lostItem.status = 'MATCHED';
        await lostItem.save();

        // Add System Comment
        await Comment.create({
          itemId: lostId,
          itemType: 'LostItem',
          userId: req.user._id,
          text: `I found this item! View it here: match://${foundItem._id}`, // Special format or just text
          isSystemMessage: true
        });

        // Notify Lost Item Owner
        const notificationService = require('../services/notificationService');
        const ownerUser = await User.findById(lostItem.userId);
        if (ownerUser) {
          const notifResult = await notificationService.notifyFoundMatch({
            user: ownerUser,
            foundItem: foundItem,
            lostItem: lostItem
          });
          
          return res.status(201).json({
            success: true,
            data: foundItem,
            message: 'Found item reported successfully. ' + (notifResult.emailResult?.success ? 'Owner notified via email.' : ''),
            notificationStatus: notifResult.emailResult
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: foundItem,
      message: 'Found item reported successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoundItems,
  getFoundItemById,
  createFoundItem
};
