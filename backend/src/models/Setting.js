'use strict';

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    group: {
      type: String,
      default: 'general',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
settingSchema.index({ key: 1 });
settingSchema.index({ group: 1 });

module.exports = mongoose.model('Setting', settingSchema);
