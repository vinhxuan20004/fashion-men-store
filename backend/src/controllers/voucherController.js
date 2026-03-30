'use strict';

const Voucher = require('../models/Voucher');
const { paginate, calculateDiscount } = require('../utils/helpers');

// ─── Create Voucher (Admin) ───────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A voucher with this code already exists.' });
    }

    const voucher = await Voucher.create({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Voucher created successfully.',
      data: { voucher },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Vouchers (Admin) ─────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isActive, search } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.code = { $regex: search.toUpperCase(), $options: 'i' };

    const [vouchers, total] = await Promise.all([
      Voucher.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Voucher.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        vouchers,
        pagination: {
          total,
          page: pg,
          limit: lim,
          totalPages: Math.ceil(total / lim),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Active Vouchers (Public) ─────────────────────────────────────────────
const getActive = async (req, res, next) => {
  try {
    const now = new Date();

    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select('-usedBy -usedCount -usageLimit')
      .sort({ endDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { vouchers },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Voucher (Admin) ───────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (code && code.toUpperCase() !== voucher.code) {
      const existing = await Voucher.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A voucher with this code already exists.' });
      }
      voucher.code = code.toUpperCase();
    }

    if (type !== undefined) voucher.type = type;
    if (value !== undefined) voucher.value = Number(value);
    if (minOrderValue !== undefined) voucher.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) voucher.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (usageLimit !== undefined) voucher.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (startDate !== undefined) voucher.startDate = new Date(startDate);
    if (endDate !== undefined) voucher.endDate = new Date(endDate);
    if (isActive !== undefined) voucher.isActive = Boolean(isActive);

    await voucher.save();

    return res.status(200).json({
      success: true,
      message: 'Voucher updated successfully.',
      data: { voucher },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Voucher (Admin) ───────────────────────────────────────────────────
const deleteVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findByIdAndDelete(id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    return res.status(200).json({ success: true, message: 'Voucher deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── Validate Voucher (User) ──────────────────────────────────────────────────
const validateVoucher = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Voucher code is required.' });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    const now = new Date();

    if (!voucher.isActive) {
      return res.status(400).json({ success: false, message: 'Voucher is not active.' });
    }
    if (now < voucher.startDate) {
      return res.status(400).json({ success: false, message: 'Voucher is not yet valid.' });
    }
    if (now > voucher.endDate) {
      return res.status(400).json({ success: false, message: 'Voucher has expired.' });
    }
    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: 'Voucher usage limit reached.' });
    }
    if (voucher.usedBy.some((uid) => uid.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'You have already used this voucher.' });
    }

    const orderSubtotal = subtotal ? Number(subtotal) : 0;

    if (orderSubtotal < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ${voucher.minOrderValue.toLocaleString('vi-VN')} VND.`,
      });
    }

    const discountAmount = calculateDiscount(voucher, orderSubtotal);

    return res.status(200).json({
      success: true,
      message: 'Voucher is valid.',
      data: {
        voucher: {
          code: voucher.code,
          type: voucher.type,
          value: voucher.value,
          maxDiscount: voucher.maxDiscount,
          minOrderValue: voucher.minOrderValue,
        },
        discountAmount,
        subtotalAfterDiscount: orderSubtotal - discountAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  getAll,
  getActive,
  update,
  delete: deleteVoucher,
  validateVoucher,
};
