const express = require('express');
const { 
  createLostItem, 
  getLostItems,
  getMyLostItems, 
  getLostItem,
  getNearbyLostItems,
  getMatches,
  updateLostItem,
  closeLostItem
} = require('../controllers/lostController');
const requireAuth = require('../middleware/auth');
const { upload } = require('../utils/upload');

const router = express.Router();

router.get('/', requireAuth, getLostItems);
router.post('/', requireAuth, upload.single('image'), createLostItem);
router.get('/mine', requireAuth, getMyLostItems);
router.get('/nearby', requireAuth, getNearbyLostItems);
router.patch('/:id', requireAuth, updateLostItem);
router.patch('/:id/close', requireAuth, closeLostItem);
router.get('/:id/matches', requireAuth, getMatches);
router.get('/:id', requireAuth, getLostItem);

module.exports = router;
