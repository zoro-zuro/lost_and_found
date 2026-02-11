const FoundItem = require('../models/FoundItem');
const User = require('../models/User');
const { getImageUrl } = require('../utils/upload');

// Helper function to check if found item matches lost item
const checkItemMatch = (foundItem, lostItem) => {
  let matchScore = 0;
  
  // Category match (most important)
  if (foundItem.category === lostItem.category) {
    matchScore += 40;
  }
  
  // Item name similarity
  const foundName = foundItem.itemName.toLowerCase();
  const lostName = lostItem.itemName.toLowerCase();
  
  // Exact name match
  if (foundName === lostName) {
    matchScore += 30;
  }
  // Partial name match
  else if (foundName.includes(lostName) || lostName.includes(foundName)) {
    matchScore += 20;
  }
  // Word overlap
  else {
    const foundWords = foundName.split(' ');
    const lostWords = lostName.split(' ');
    const commonWords = foundWords.filter(word => lostWords.includes(word));
    if (commonWords.length > 0) {
      matchScore += 10 * (commonWords.length / Math.max(foundWords.length, lostWords.length));
    }
  }
  
  // Description similarity (basic keyword matching)
  const foundDesc = foundItem.description.toLowerCase();
  const lostDesc = lostItem.description.toLowerCase();
  const descWords = foundDesc.split(' ').filter(word => word.length > 3);
  const lostDescWords = lostDesc.split(' ').filter(word => word.length > 3);
  const commonDescWords = descWords.filter(word => lostDescWords.includes(word));
  
  if (commonDescWords.length > 0) {
    matchScore += 15 * (commonDescWords.length / Math.max(descWords.length, lostDescWords.length));
  }
  
  // Location similarity
  if (foundItem.locationFound && lostItem.locationLost) {
    const foundLocation = foundItem.locationFound.toLowerCase();
    const lostLocation = lostItem.locationLost.toLowerCase();
    
    if (foundLocation === lostLocation) {
      matchScore += 15;
    } else if (foundLocation.includes(lostLocation) || lostLocation.includes(foundLocation)) {
      matchScore += 10;
    }
  }
  
  // Color match (if both have color info)
  if (foundItem.color && lostItem.color) {
    const foundColor = foundItem.color.toLowerCase();
    const lostColor = lostItem.color.toLowerCase();
    
    if (foundColor === lostColor) {
      matchScore += 10;
    } else if (foundColor.includes(lostColor) || lostColor.includes(foundColor)) {
      matchScore += 5;
    }
  }
  
  // Brand match (if both have brand info)
  if (foundItem.brand && lostItem.brand) {
    const foundBrand = foundItem.brand.toLowerCase();
    const lostBrand = lostItem.brand.toLowerCase();
    
    if (foundBrand === lostBrand) {
      matchScore += 10;
    } else if (foundBrand.includes(lostBrand) || lostBrand.includes(foundBrand)) {
      matchScore += 5;
    }
  }
  
  // Date proximity (within 7 days)
  if (foundItem.dateFound && lostItem.dateLost) {
    const timeDiff = Math.abs(new Date(foundItem.dateFound) - new Date(lostItem.dateLost));
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 7) {
      matchScore += 10 * (1 - daysDiff / 7); // Decrease score as days increase
    }
  }
  
  console.log(`Match score between "${foundItem.itemName}" and "${lostItem.itemName}": ${matchScore}`);
  
  // Return true if score is above threshold (70% match)
  return matchScore >= 70;
};

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
    let query = {
      visibility: 'PUBLIC'
    };

    // Search by itemName or description
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by location
    if (location) {
      query.locationFound = { $regex: location, $options: 'i' };
    }

    const foundItems = await FoundItem.find(query)
      .sort({ dateFound: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('reportedBy', 'name');

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
    console.log('User from auth middleware:', req.user);
    console.log('User ID:', req.user?._id);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID missing'
      });
    }
    
    const {
      itemName,
      category,
      dateFound,
      locationFound,
      description,
      color,
      brand,
      visibility,
      lostId, // Optional: ID of the lost item this matches (legacy)
      linkedLostItemId // Optional: ID of the lost item this matches (new)
    } = req.body;

    // Validation - check all required fields
    const missingFields = [];
    
    if (!itemName) missingFields.push('Item Name');
    if (!category) missingFields.push('Category');
    if (!dateFound) missingFields.push('Date Found');
    if (!locationFound) missingFields.push('Location Found');
    if (!description) missingFields.push('Description');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please complete the following required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }

    // Handle image upload and processing
    let imageUrl = null;
    if (req.file) {
      const { processImageUpload } = require('../utils/upload');
      imageUrl = processImageUpload(req.file);
      console.log('Image processed:', imageUrl ? 'Success' : 'Failed');
    }

    const foundData = {
      itemName,
      category,
      dateFound,
      locationFound,
      description,
      color,
      brand,
      visibility: visibility || 'PUBLIC',
      imageUrl,
      reportedBy: req.user._id
    };

    if (lostId || linkedLostItemId) {
      foundData.linkedLostItemId = lostId || linkedLostItemId;
    }

    const foundItem = await FoundItem.create(foundData);

    // Automatic Matching Logic - Find potential matches for new found items
    const LostItem = require('../models/LostItem');
    const notificationService = require('../services/notificationService');
    
    // Find potential matches based on category, item name, and description
    const potentialMatches = await LostItem.find({
      category: foundItem.category,
      status: 'OPEN', // Only match with open lost items
      visibility: 'PUBLIC', // Only match with public lost items
      notifyRequested: true, // Only notify users who requested notifications
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Only from last 30 days
    }).populate('userId', 'name email emailNotificationsEnabled notifyScope');

    // Check each potential match for similarity
    for (const lostItem of potentialMatches) {
      const isMatch = checkItemMatch(foundItem, lostItem);
      
      if (isMatch) {
        console.log(`Found match: Found item "${foundItem.itemName}" matches Lost item "${lostItem.itemName}"`);
        
        // Update lost item status
        lostItem.status = 'MATCHED';
        await lostItem.save();
        
        // Link the found item to the lost item
        foundItem.linkedLostItemId = lostItem._id;
        await foundItem.save();
        
        // Notify the lost item owner
        if (lostItem.userId) {
          try {
            const notifResult = await notificationService.notifyFoundMatch({
              user: lostItem.userId,
              foundItem: foundItem,
              lostItem: lostItem
            });
            
            console.log(`Notification sent to ${lostItem.userId.name} for match: ${notifResult}`);
          } catch (notifError) {
            console.error('Failed to send match notification:', notifError);
          }
        }
        
        break; // Only match with one lost item for now
      }
    }

    // If manually linked to a lost item, also trigger match logic
    if (lostId || linkedLostItemId) {
      const Notification = require('../models/Notification');
      const Comment = require('../models/Comment');
      
      const actualLostItemId = lostId || linkedLostItemId;
      const lostItem = await LostItem.findById(actualLostItemId);
      
      if (lostItem) {
        // Update Lost Item Status
        lostItem.status = 'MATCHED';
        await lostItem.save();

        // Add System Comment
        await Comment.create({
          itemId: actualLostItemId,
          itemType: 'LostItem',
          userId: req.user._id,
          text: `I found this item! View it here: match://${foundItem._id}`,
          isSystemMessage: true
        });

        // Notify Lost Item Owner
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

// @desc    Get user's found items
// @route   GET /api/found/mine
// @access  Private
const getMyFoundItems = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const foundItems = await FoundItem.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: foundItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update found item report
// @route   PATCH /api/found/:id
// @access  Private
const updateFoundItem = async (req, res, next) => {
  try {
    const { itemName, category, description, locationFound } = req.body;
    
    // Find the found item
    const foundItem = await FoundItem.findById(req.params.id);
    
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found'
      });
    }

    // Check if user is the reporter or admin
    if (foundItem.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Update fields
    if (itemName) foundItem.itemName = itemName;
    if (category) foundItem.category = category;
    if (description) foundItem.description = description;
    if (locationFound) foundItem.locationFound = locationFound;

    await foundItem.save();

    res.status(200).json({
      success: true,
      data: foundItem,
      message: 'Found item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close found item report
// @route   PATCH /api/found/:id/close
// @access  Private
const closeFoundItem = async (req, res, next) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);

    if (!foundItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user is the reporter or admin
    if (foundItem.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to close this report' });
    }

    // Update status to closed
    foundItem.status = 'CLOSED';
    foundItem.closedAt = new Date();
    await foundItem.save();

    res.status(200).json({
      success: true,
      data: foundItem,
      message: 'Found item closed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoundItems,
  getFoundItemById,
  createFoundItem,
  getMyFoundItems,
  updateFoundItem,
  closeFoundItem
};
