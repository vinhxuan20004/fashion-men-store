'use strict';

const Setting = require('../models/Setting');

/**
 * Get public settings for the frontend (all users)
 * Only returns non-sensitive keys.
 */
const getPublicSettings = async (req, res, next) => {
  try {
    const publicKeys = ['payment_bank_transfer', 'payment_methods_status'];
    
    const settings = await Setting.find({ key: { $in: publicKeys } }).lean();
    
    // Format into a key-value object for easier consumption
    const formattedSettings = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: { settings: formattedSettings },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicSettings,
};
