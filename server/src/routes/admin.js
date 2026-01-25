const express = require('express');
const router = express.Router();
const { 
  getAdminStats, 
  getAllLostItems, 
  updateLostItemStatus,
  createFoundItem,
  getAllClaims,
  updateClaimStatus
} = require('../controllers/adminController');
const requireAuth = require('../middleware/auth');
const checkRole = require('../middleware/roleAuth');

// All routes require login + ADMIN or STAFF role
router.use(requireAuth);
router.use(checkRole(['ADMIN', 'STAFF']));

// Dashboard Stats
router.get('/stats', getAdminStats);

// Lost Items Management
router.get('/lost', getAllLostItems);
router.patch('/lost/:id', updateLostItemStatus);

// Found Items Management
// Note: Staff/Admin can create found items directly via normal /api/found too, 
// but this route might be for specific admin overrides or bulk actions if needed.
// For now, we will reuse the existing create found item controller or add a specific one if needed.
// reusing standard create but maybe with auto-approve? 
// Standard create in foundController usually pending? Admin should be auto-approve.
router.post('/found', createFoundItem);

// Claims Management
router.get('/claims', getAllClaims);
router.patch('/claims/:id', updateClaimStatus);

module.exports = router;
