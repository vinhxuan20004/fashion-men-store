'use strict';

const mongoose = require('mongoose');
const { generateSlug } = require('../utils/helpers');

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, 'Variant size is required'],
    },
    color: {
      type: String,
      required: [true, 'Variant color name is required'],
      trim: true,
    },
    colorCode: {
      type: String,
      trim: true,
      default: '#000000',
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color code must be a valid hex color'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Sale price cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    material: {
      type: String,
      default: '',
      trim: true,
    },
    brand: {
      type: String,
      default: '',
      trim: true,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ─── Virtuals ───────────────────────────────────────────────────────────────
productSchema.virtual('totalStock').get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
});

productSchema.virtual('averageRating').get(function () {
  if (!this.reviewCount || this.reviewCount === 0) return 0;
  return parseFloat((this.ratingSum / this.reviewCount).toFixed(1));
});

// ─── Pre-save: auto generate slug ───────────────────────────────────────────
productSchema.pre('save', async function (next) {
  if (!this.isModified('name') && this.slug) return next();

  let baseSlug = generateSlug(this.name);
  let slug = baseSlug;
  let counter = 1;
  const Product = mongoose.model('Product');

  while (true) {
    const existing = await Product.findOne({ slug, _id: { $ne: this._id } });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

module.exports = mongoose.model('Product', productSchema);
