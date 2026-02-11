const express = require('express');
const { getFoundItems, getFoundItemById, createFoundItem, getMyFoundItems, updateFoundItem, closeFoundItem } = require('../controllers/foundController');
const requireAuth = require('../middleware/auth');
const { upload } = require('../utils/upload');

const router = express.Router();

router.post('/', requireAuth, upload.single('image'), createFoundItem);
router.get('/', requireAuth, getFoundItems);
router.get('/mine', requireAuth, getMyFoundItems);
router.patch('/:id', requireAuth, updateFoundItem);
router.patch('/:id/close', requireAuth, closeFoundItem);
router.get('/:id', requireAuth, getFoundItemById);

module.exports = router;
