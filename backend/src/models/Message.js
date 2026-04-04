'use strict';

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ', 'REPLIED'],
      default: 'UNREAD',
    },
    reply: {
      message: String,
      repliedAt: Date,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleString('vi-VN');
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
