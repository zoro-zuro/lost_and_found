const express = require('express');
const { getComments, addComment } = require('../controllers/commentController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/:itemType/:itemId', requireAuth, getComments);
router.post('/:itemType/:itemId', requireAuth, addComment);

module.exports = router;
