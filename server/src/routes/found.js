const express = require('express');
const { getFoundItems, getFoundItemById, createFoundItem } = require('../controllers/foundController');
const requireAuth = require('../middleware/auth');
const { upload } = require('../utils/upload');

const router = express.Router();

router.post('/', requireAuth, upload.single('image'), createFoundItem);
router.get('/', requireAuth, getFoundItems);
router.get('/:id', requireAuth, getFoundItemById);

module.exports = router;
