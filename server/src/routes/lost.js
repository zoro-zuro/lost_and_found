const express = require('express');
const { 
  createLostItem, 
  getMyLostItems, 
  getLostItem,
  getNearbyLostItems,
  getMatches 
} = require('../controllers/lostController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createLostItem);
router.get('/mine', requireAuth, getMyLostItems);
router.get('/nearby', requireAuth, getNearbyLostItems);
router.get('/:id/matches', requireAuth, getMatches);
router.get('/:id', requireAuth, getLostItem);

module.exports = router;
