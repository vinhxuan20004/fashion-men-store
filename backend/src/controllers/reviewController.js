'use strict';

const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { paginate } = require('../utils/helpers');

// ─── Create Review ────────────────────────────────────────────────────────────
const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment, orderId } = req.body;

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Verify the order is DELIVERED and belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      orderStatus: 'DELIVERED',
      'items.product': productId,
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products from your delivered orders.',
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId,
    });

    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product for this order.' });
    }

    const images = req.files ? req.files.map((f) => `/uploads/products/${f.filename}`) : [];

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating: Number(rating),
      comment,
      images,
      isApproved: false,
    });

    await review.populate('user', 'name avatar');

    return res.status(201).json({
      success: true,
      message: 'Review submitted. It will be visible after approval.',
      data: { review },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Product Reviews ──────────────────────────────────────────────────────
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const filter = { product: productId, isApproved: true };
    if (rating) filter.rating = Number(rating);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Rating distribution
    const distribution = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId), isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => { ratingDist[d._id] = d.count; });

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingDistribution: ratingDist,
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

// ─── Approve Review (Admin) ───────────────────────────────────────────────────
const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.isApproved = true;
    if (adminNote !== undefined) review.adminNote = adminNote;
    await review.save();

    return res.status(200).json({ success: true, message: 'Review approved.', data: { review } });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Review (Admin) ────────────────────────────────────────────────────
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    return res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── Get User's Reviews ───────────────────────────────────────────────────────
const getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: req.user._id })
        .populate('product', 'name slug images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Review.countDocuments({ user: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
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

// ─── Get All Reviews (Admin) ──────────────────────────────────────────────────
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isApproved } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email')
        .populate('product', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
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

module.exports = {
  createReview,
  getProductReviews,
  approveReview,
  deleteReview,
  getUserReviews,
  getAllReviews,
};
