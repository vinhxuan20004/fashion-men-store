'use strict';

const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Public settings for the frontend (no auth required)
router.get('/public', settingController.getPublicSettings);

module.exports = router;
