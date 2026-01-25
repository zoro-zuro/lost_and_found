const express = require('express');
const { createInterest, getMyInterests, getInterestsByFoundItem } = require('../controllers/interestController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createInterest);
router.get('/mine', requireAuth, getMyInterests);
router.get('/found/:foundItemId', requireAuth, getInterestsByFoundItem);

module.exports = router;
