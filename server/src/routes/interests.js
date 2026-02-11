const express = require('express');
const { createInterest, getMyInterests, getInterestsByLostItem, getInterestsByFoundItem, addReplyToInterest } = require('../controllers/interestController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createInterest);
router.get('/mine', requireAuth, getMyInterests);
router.get('/lost/:lostItemId', requireAuth, getInterestsByLostItem);
router.get('/found/:foundItemId', requireAuth, getInterestsByFoundItem);
router.post('/:id/reply', requireAuth, addReplyToInterest);

module.exports = router;
