const express = require('express');
const { createLostItem, getMyLostItems, getMatches } = require('../controllers/lostController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createLostItem);
router.get('/mine', requireAuth, getMyLostItems);
router.get('/:id/matches', requireAuth, getMatches);

module.exports = router;
