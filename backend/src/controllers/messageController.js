'use strict';

const Message = require('../models/Message');

// @desc    Send a message (Public - Optional Auth)
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const userId = req.user ? req.user._id : null;

    // Use provided info OR user info from token
    const finalName = name || (req.user ? req.user.name : 'Khách');
    const finalEmail = email || (req.user ? req.user.email : 'guest@example.com');

    const newMessage = await Message.create({
      user: userId,
      name: finalName,
      email: finalEmail,
      message,
    });

    // Emit to admin
    const socket = require('../socket');
    socket.getIO().emit('new_message', newMessage);

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/messages/admin/all
// @access  Private/Admin
const getAllMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a message (Admin)
// @route   PATCH /api/messages/admin/:id/reply
// @access  Private/Admin
const replyMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const messageId = req.params.id;

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    msg.reply = {
      message,
      repliedAt: Date.now(),
      repliedBy: req.user._id,
    };
    msg.status = 'REPLIED';

    await msg.save();

    const socket = require('../socket');
    socket.getIO().emit('reply_received', { 
      messageId: msg._id, 
      reply: msg.reply,
      userId: msg.user
    });

    res.status(200).json({
      success: true,
      data: { message: msg },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status (Admin)
// @route   PATCH /api/messages/admin/:id/status
// @access  Private/Admin
const updateStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      const msg = await Message.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );
      
      if (!msg) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
  
      res.status(200).json({
        success: true,
        data: { message: msg },
      });
    } catch (error) {
      next(error);
    }
};

// @desc    Delete a message (Admin)
// @route   DELETE /api/messages/admin/:id
// @access  Private/Admin
const deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations (Admin - Grouped by Email)
// @route   GET /api/messages/admin/conversations
// @access  Private/Admin
const getAllConversations = async (req, res, next) => {
  try {
    const conversations = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$email',
          name: { $first: '$name' },
          email: { $first: '$email' },
          lastMessage: { $first: '$message' },
          lastCreatedAt: { $first: '$createdAt' },
          status: { $first: '$status' },
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$status', 'UNREAD'] }, 1, 0] }
          }
        }
      },
      { $sort: { lastCreatedAt: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages by email (Admin)
// @route   GET /api/messages/admin/conversation/:email
// @access  Private/Admin
const getMessagesByEmail = async (req, res, next) => {
  try {
    const messages = await Message.find({ email: req.params.email }).sort({ createdAt: 1 });
    
    // Mark as READ when viewed
    await Message.updateMany(
      { email: req.params.email, status: 'UNREAD' },
      { status: 'READ' }
    );

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my messages (User)
// @route   GET /api/messages/my
// @access  Private
const getMyMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
  replyMessage,
  updateStatus,
  deleteMessage,
  getAllConversations,
  getMessagesByEmail,
  getMyMessages,
};
