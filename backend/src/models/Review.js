'use strict';

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    adminNote: {
      type: String,
      default: '',
      maxlength: [500, 'Admin note cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ order: 1 });
// One review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// ─── Post-save: update product rating stats ─────────────────────────────────
reviewSchema.post('save', async function () {
  await updateProductRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateProductRating(doc.product);
});

async function updateProductRating(productId) {
  try {
    const Product = mongoose.model('Product');
    const result = await mongoose.model('Review').aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: '$product',
          ratingSum: { $sum: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratingSum: result[0].ratingSum,
        reviewCount: result[0].reviewCount,
      });
    } else {
      await Product.findByIdAndUpdate(productId, { ratingSum: 0, reviewCount: 0 });
    }
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
}

module.exports = mongoose.model('Review', reviewSchema);
