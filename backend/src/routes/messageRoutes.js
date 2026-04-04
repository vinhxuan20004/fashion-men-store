'use strict';

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Public route to send a message (optional authentication for users)
router.post('/', optionalAuth, messageController.sendMessage);

// User route to get his own messages
router.get('/my', authenticate, messageController.getMyMessages);

// Admin routes
router.use(authenticate, authorize('ADMIN'));

router.get('/admin/all', messageController.getAllMessages);
router.get('/admin/conversations', messageController.getAllConversations);
router.get('/admin/conversation/:email', messageController.getMessagesByEmail);
router.patch('/admin/:id/reply', messageController.replyMessage);
router.patch('/admin/:id/status', messageController.updateStatus);
router.delete('/admin/:id', messageController.deleteMessage);

module.exports = router;
