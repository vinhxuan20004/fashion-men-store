'use strict';

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const { calculateDiscount } = require('../utils/helpers');

// ─── Get Cart ─────────────────────────────────────────────────────────────────
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug images price salePrice variants isActive brand',
        populate: { path: 'category', select: 'name slug' },
      })
      .populate('appliedVoucher');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items whose products are no longer active
    const activeItems = cart.items.filter((item) => item.product && item.product.isActive);
    if (activeItems.length !== cart.items.length) {
      cart.items = activeItems;
      await cart.save();
    }

    const cartObj = cart.toObject({ virtuals: true });

    return res.status(200).json({ success: true, data: { cart: cartObj } });
  } catch (err) {
    next(err);
  }
};

// ─── Add Item ─────────────────────────────────────────────────────────────────
const addItem = async (req, res, next) => {
  try {
    const { productId, size, color, variantId, quantity = 1 } = req.body;

    if (!productId || (!variantId && (!size || !color))) {
      return res.status(400).json({ success: false, message: 'productId and (variantId or size/color) are required.' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    // Find the matching variant
    let variant;
    if (variantId) {
      variant = product.variants.id(variantId);
    } else {
      variant = product.variants.find(
        (v) => v.size === size && v.color.toLowerCase() === color.toLowerCase()
      );
    }

    if (!variant) {
      return res.status(404).json({ success: false, message: 'Product variant not found.' });
    }

    const itemSize = variant.size;
    const itemColor = variant.color;

    // Check stock
    if (variant.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${variant.stock}.`,
      });
    }

    const itemPrice = product.salePrice || product.price;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if same variant already in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant.size === itemSize &&
        item.variant.color.toLowerCase() === itemColor.toLowerCase()
    );

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + qty;
      if (newQty > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${variant.stock}, already in cart: ${cart.items[existingIndex].quantity}.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = itemPrice;
    } else {
      cart.items.push({
        product: productId,
        variant: { size: itemSize, color: itemColor },
        quantity: qty,
        price: itemPrice,
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug images price salePrice isActive',
    });

    return res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      data: { cart: cart.toObject({ virtuals: true }) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Item ──────────────────────────────────────────────────────────────
const updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    // Validate stock
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    const variant = product.variants.find(
      (v) => v.size === item.variant.size && v.color.toLowerCase() === item.variant.color.toLowerCase()
    );

    if (!variant || variant.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${variant ? variant.stock : 0}.`,
      });
    }

    item.quantity = qty;
    item.price = product.salePrice || product.price;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart item updated.',
      data: { cart: cart.toObject({ virtuals: true }) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Remove Item ──────────────────────────────────────────────────────────────
const removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    item.deleteOne();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: { cart: cart.toObject({ virtuals: true }) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(200).json({ success: true, message: 'Cart is already empty.' });
    }

    cart.items = [];
    cart.appliedVoucher = null;
    await cart.save();

    return res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    next(err);
  }
};

// ─── Apply Voucher ────────────────────────────────────────────────────────────
const applyVoucher = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Voucher code is required.' });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    const now = new Date();
    if (!voucher.isActive) {
      return res.status(400).json({ success: false, message: 'Voucher is no longer active.' });
    }
    if (now < voucher.startDate) {
      return res.status(400).json({ success: false, message: 'Voucher is not yet valid.' });
    }
    if (now > voucher.endDate) {
      return res.status(400).json({ success: false, message: 'Voucher has expired.' });
    }
    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: 'Voucher usage limit has been reached.' });
    }
    if (voucher.usedBy.some((uid) => uid.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'You have already used this voucher.' });
    }

    // Calculate discount based on user's cart subtotal
    const cart = await Cart.findOne({ user: req.user._id });
    const subtotal = cart ? cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

    if (subtotal < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this voucher is ${voucher.minOrderValue.toLocaleString('vi-VN')} VND.`,
      });
    }

    const discountAmount = calculateDiscount(voucher, subtotal);

    // Save voucher to cart
    cart.appliedVoucher = voucher._id;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Voucher applied successfully.',
      data: {
        voucher: {
          _id: voucher._id,
          code: voucher.code,
          type: voucher.type,
          value: voucher.value,
          maxDiscount: voucher.maxDiscount,
        },
        subtotal,
        discountAmount,
        total: subtotal - discountAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyVoucher,
};
