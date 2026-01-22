const express = require('express');
const { createInterest } = require('../controllers/interestController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createInterest);

module.exports = router;
