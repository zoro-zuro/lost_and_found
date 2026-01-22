const express = require('express');
const { getFoundItems, getFoundItemById } = require('../controllers/foundController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getFoundItems);
router.get('/:id', requireAuth, getFoundItemById);

module.exports = router;
