'use strict';

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const Payment = require('../models/Payment');
const { paginate, calculateDiscount } = require('../utils/helpers');

const SHIPPING_FEE = 30000; // 30,000 VND flat rate

// ─── Create Order ─────────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, voucherCode, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Validate all items and check stock
    const orderItems = [];
    const stockUpdates = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product?.name || 'unknown'}" is no longer available.`,
        });
      }

      const variantIndex = product.variants.findIndex(
        (v) => v.size === item.variant.size && v.color.toLowerCase() === item.variant.color.toLowerCase()
      );

      if (variantIndex === -1) {
        return res.status(400).json({
          success: false,
          message: `Variant (${item.variant.size}, ${item.variant.color}) not found for "${product.name}".`,
        });
      }

      const variant = product.variants[variantIndex];
      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}" (${item.variant.size}, ${item.variant.color}). Available: ${variant.stock}.`,
        });
      }

      const itemPrice = product.salePrice || product.price;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        variant: { size: item.variant.size, color: item.variant.color },
        quantity: item.quantity,
        price: itemPrice,
        totalPrice: itemPrice * item.quantity,
      });

      stockUpdates.push({
        productId: product._id,
        variantIndex,
        quantity: item.quantity,
      });
    }

    // Calculate subtotal
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Apply voucher
    let discountAmount = 0;
    let voucherDoc = null;

    if (voucherCode) {
      voucherDoc = await Voucher.findOne({ code: voucherCode.toUpperCase() });
      if (!voucherDoc) {
        return res.status(404).json({ success: false, message: 'Voucher not found.' });
      }

      const now = new Date();
      if (!voucherDoc.isActive || now < voucherDoc.startDate || now > voucherDoc.endDate) {
        return res.status(400).json({ success: false, message: 'Voucher is not valid.' });
      }
      if (voucherDoc.usageLimit !== null && voucherDoc.usedCount >= voucherDoc.usageLimit) {
        return res.status(400).json({ success: false, message: 'Voucher usage limit reached.' });
      }
      if (voucherDoc.usedBy.some((uid) => uid.toString() === req.user._id.toString())) {
        return res.status(400).json({ success: false, message: 'You have already used this voucher.' });
      }
      if (subtotal < voucherDoc.minOrderValue) {
        return res.status(400).json({
          success: false,
          message: `Minimum order value for this voucher is ${voucherDoc.minOrderValue.toLocaleString('vi-VN')} VND.`,
        });
      }

      discountAmount = calculateDiscount(voucherDoc, subtotal);
    }

    const shippingFee = SHIPPING_FEE;
    const total = subtotal - discountAmount + shippingFee;

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
      subtotal,
      discountAmount,
      shippingFee,
      total,
      voucher: voucherDoc ? voucherDoc._id : null,
      voucherCode: voucherCode ? voucherCode.toUpperCase() : '',
      notes: notes || '',
    });

    // Create payment record
    await Payment.create({
      order: order._id,
      user: req.user._id,
      method: paymentMethod,
      amount: total,
      status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
    });

    // Deduct stock
    for (const update of stockUpdates) {
      await Product.findByIdAndUpdate(update.productId, {
        $inc: {
          [`variants.${update.variantIndex}.stock`]: -update.quantity,
          soldCount: update.quantity,
        },
      });
    }

    // Mark voucher as used
    if (voucherDoc) {
      await Voucher.findByIdAndUpdate(voucherDoc._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: req.user._id },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get User's Orders ────────────────────────────────────────────────────────
const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const filter = { user: req.user._id };
    if (status) filter.orderStatus = status.toUpperCase();

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name slug images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
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

// ─── Get Order By ID ──────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('voucher', 'code type value')
      .populate('items.product', 'name slug images')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Regular users can only see their own orders
    if (req.user.role !== 'ADMIN' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const payment = await Payment.findOne({ order: id }).lean();

    return res.status(200).json({ success: true, data: { order, payment } });
  } catch (err) {
    next(err);
  }
};

// ─── Cancel Order ─────────────────────────────────────────────────────────────
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (order.orderStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}.`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variantIndex = product.variants.findIndex(
          (v) => v.size === item.variant.size && v.color.toLowerCase() === item.variant.color.toLowerCase()
        );
        if (variantIndex !== -1) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: {
              [`variants.${variantIndex}.stock`]: item.quantity,
              soldCount: -item.quantity,
            },
          });
        }
      }
    }

    // Restore voucher usage
    if (order.voucher) {
      await Voucher.findByIdAndUpdate(order.voucher, {
        $inc: { usedCount: -1 },
        $pull: { usedBy: req.user._id },
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancelReason = reason || 'Cancelled by customer';
    await order.save();

    await Payment.findOneAndUpdate({ order: id }, { $set: { status: 'FAILED' } });

    return res.status(200).json({ success: true, message: 'Order cancelled successfully.', data: { order } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const validStatuses = ['CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Validate status transitions: Allow jumping forward only
    const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    const targetIndex = statusOrder.indexOf(status);

    // Cancel is always allowed from PENDING, CONFIRMED, SHIPPING
    if (status === 'CANCELLED') {
      if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
        return res.status(400).json({ success: false, message: `Cannot cancel an order that is ${order.orderStatus}.` });
      }
    } else if (targetIndex <= currentIndex) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.orderStatus} to ${status}. Only forward transitions are allowed.`,
      });
    }

    order.orderStatus = status;

    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
      order.paidAt = new Date();
      order.deliveredAt = new Date();
      await Payment.findOneAndUpdate({ order: id }, { $set: { status: 'SUCCESS' } });
    }

    if (status === 'CANCELLED') {
      order.cancelReason = cancelReason || 'Cancelled by admin';

      // Restore stock on admin cancellation
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const variantIndex = product.variants.findIndex(
            (v) => v.size === item.variant.size && v.color.toLowerCase() === item.variant.color.toLowerCase()
          );
          if (variantIndex !== -1) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: {
                [`variants.${variantIndex}.stock`]: item.quantity,
                soldCount: -item.quantity,
              },
            });
          }
        }
      }

      await Payment.findOneAndUpdate({ order: id }, { $set: { status: 'FAILED' } });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      paymentMethod,
      search,
      startDate,
      endDate,
    } = req.query;

    const { skip, limit: lim, page: pg } = paginate(page, limit);
    const filter = {};

    if (status) filter.orderStatus = status.toUpperCase();
    if (paymentStatus) filter.paymentStatus = paymentStatus.toUpperCase();
    if (paymentMethod) filter.paymentMethod = paymentMethod.toUpperCase();
    if (req.query.user) filter.user = req.query.user;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name slug images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
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

// ─── Get Order Stats (Admin) ──────────────────────────────────────────────────
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, totalRevenue: stat.totalRevenue };
      return acc;
    }, {});

    return res.status(200).json({ success: true, data: { stats: formattedStats } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
};
