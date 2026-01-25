const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Interest = require('../models/Interest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin/Staff)
const getAdminStats = async (req, res, next) => {
  try {
    const totalLost = await LostItem.countDocuments();
    const totalFound = await FoundItem.countDocuments();
    const totalClaims = await Interest.countDocuments();
    const pendingClaims = await Interest.countDocuments({ status: 'PENDING' });
    const pendingLostReviews = await LostItem.countDocuments({ reviewStatus: 'PENDING_REVIEW' });

    res.status(200).json({
      success: true,
      data: {
        totalLost,
        totalFound,
        totalClaims,
        pendingClaims,
        pendingLostReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all lost items (with filters)
// @route   GET /api/admin/lost
// @access  Private (Admin/Staff)
const getAllLostItems = async (req, res, next) => {
  try {
    const { status, visibility, reviewStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (visibility) query.visibility = visibility;
    if (reviewStatus) query.reviewStatus = reviewStatus;

    const totalCount = await LostItem.countDocuments(query);

    const lostItems = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email registerNumber staffId role phone');

    res.status(200).json({
      success: true,
      data: lostItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lost item status (approve/reject/close)
// @route   PATCH /api/admin/lost/:id
// @access  Private (Admin/Staff)
const updateLostItemStatus = async (req, res, next) => {
  try {
    const { reviewStatus, publishStatus, adminNote, status } = req.body;
    
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (reviewStatus) lostItem.reviewStatus = reviewStatus;
    if (publishStatus) lostItem.publishStatus = publishStatus;
    if (adminNote) lostItem.adminNote = adminNote;
    if (status) lostItem.status = status;

    // Auto-publish if approved
    if (reviewStatus === 'APPROVED' && lostItem.visibility === 'CAMPUS') {
      lostItem.publishStatus = 'PUBLISHED';
    }

    await lostItem.save();

    // Notify user if status changed to APPROVED
    if (reviewStatus === 'APPROVED') {
       const user = await User.findById(lostItem.userId);
       if (user) {
         const notificationService = require('../services/notificationService');
         await notificationService.notifyLostReportPublished({
           user,
           lostItem
         });
       }
    }

    res.status(200).json({
      success: true,
      data: lostItem,
      message: 'Lost item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create found item (Admin)
// @route   POST /api/admin/found
// @access  Private (Admin/Staff)
const createFoundItem = async (req, res, next) => {
  try {
    const {
      itemName,
      category,
      dateFound,
      locationFound,
      description,
      imageUrl
    } = req.body;

    const foundItem = await FoundItem.create({
      itemName,
      category,
      dateFound,
      locationFound,
      description,
      imageUrl
      // Found items by admin don't need explicit user link usually? 
      // But schema might strictly not require userId? 
      // Checking FoundItem schema... it does NOT require userId.
    });

    res.status(201).json({
      success: true,
      data: foundItem,
      message: 'Found item created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims
// @route   GET /api/admin/claims
// @access  Private (Admin/Staff)
const getAllClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const totalCount = await Interest.countDocuments(query);
    
    const claims = await Interest.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email registerNumber phone')
      .populate('foundItemId', 'itemName category locationFound');

    res.status(200).json({
      success: true,
      data: claims,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update claim status & instructions
// @route   PATCH /api/admin/claims/:id
// @access  Private (Admin/Staff)
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, pickupInstructions } = req.body;
    
    const claim = await Interest.findById(req.params.id)
      .populate('foundItemId')
      .populate('userId');
      
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (status) claim.status = status;
    if (pickupInstructions) claim.pickupInstructions = pickupInstructions;

    await claim.save();

    // If approved, verify if we should mark found item as 'claimed' or similar?
    // Current FoundItem schema doesn't have status field shown in previous `read_file`.
    // It has `foundItemSchema` lines 1-41. No status field.
    // Ideally we should mark it? 
    // Maybe we need to add status to FoundItem too? 
    // For now, let's just save the claim. 

    const notificationService = require('../services/notificationService');
    let notifResult = null;
    if (status === 'APPROVED') {
      notifResult = await notificationService.notifyClaimApproved({
        claimantUser: claim.userId,
        item: claim.foundItemId,
        pickupInstructions: claim.pickupInstructions
      });
    } else if (status === 'REJECTED') {
      notifResult = await notificationService.notifyClaimRejected({
        claimantUser: claim.userId,
        item: claim.foundItemId
      });
    }
    
    res.status(200).json({
      success: true,
      data: claim,
      message: `Claim ${status.toLowerCase()}. ` + (notifResult?.emailResult?.success ? 'User notified via email.' : ''),
      notificationStatus: notifResult?.emailResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllLostItems,
  updateLostItemStatus,
  createFoundItem,
  getAllClaims,
  updateClaimStatus
};
