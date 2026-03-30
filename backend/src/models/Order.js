'use strict';

const mongoose = require('mongoose');
const { generateOrderNumber } = require('../utils/helpers');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productImage: {
      type: String,
      default: '',
    },
    variant: {
      size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL'],
        required: true,
      },
      color: {
        type: String,
        required: true,
        trim: true,
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'VNPAY', 'MOMO'],
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      default: null,
    },
    voucherCode: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    cancelReason: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// ─── Pre-save: auto generate orderNumber ────────────────────────────────────
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
