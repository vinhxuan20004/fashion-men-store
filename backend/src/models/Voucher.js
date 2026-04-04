'use strict';

const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Voucher code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Voucher code cannot exceed 20 characters'],
    },
    type: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      required: [true, 'Voucher type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Voucher value is required'],
      min: [0, 'Value cannot be negative'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order value cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Max discount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
voucherSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// ─── Virtual: isValid ────────────────────────────────────────────────────────
voucherSchema.virtual('isValid').get(function () {
  const now = new Date();
  const withinDates = this.startDate <= now && this.endDate >= now;
  const withinLimit = this.usageLimit === null || this.usedCount < this.usageLimit;
  return this.isActive && withinDates && withinLimit;
});

module.exports = mongoose.model('Voucher', voucherSchema);
