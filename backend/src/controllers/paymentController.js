'use strict';

const Order = require('../models/Order');
const Payment = require('../models/Payment');
const vnpay = require('../utils/vnpay');
const momo = require('../utils/momo');

// ─── VNPay: Create Payment URL ────────────────────────────────────────────────
const createVnpayPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (order.paymentMethod !== 'VNPAY') {
      return res.status(400).json({ success: false, message: 'Order payment method is not VNPay.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    // Get client IP
    const ipAddr =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const orderInfo = `Thanh toan don hang ${order.orderNumber}`;
    const paymentUrl = vnpay.createPaymentUrl(
      order._id.toString(),
      order.total,
      orderInfo,
      ipAddr
    );

    return res.status(200).json({
      success: true,
      data: { paymentUrl },
    });
  } catch (err) {
    next(err);
  }
};

// ─── VNPay: Return URL (redirect from VNPay gateway) ─────────────────────────
const vnpayReturn = async (req, res, next) => {
  try {
    const result = vnpay.verifyReturnUrl(req.query);

    if (!result.isValid) {
      return res.status(400).json({ success: false, message: 'Invalid VNPay signature.' });
    }

    const order = await Order.findById(result.txnRef);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const isSuccess = result.vnpResponseCode === '00';

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          transactionId: result.transactionId,
          gatewayResponse: req.query,
        },
      }
    );

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.paidAt = new Date();
      await order.save();
    }

    return res.status(200).json({
      success: isSuccess,
      message: isSuccess ? 'Payment successful.' : `Payment failed. Response code: ${result.vnpResponseCode}`,
      data: {
        orderId: result.txnRef,
        transactionId: result.transactionId,
        amount: result.amount,
        responseCode: result.vnpResponseCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── VNPay: IPN Webhook ───────────────────────────────────────────────────────
const vnpayIpn = async (req, res, next) => {
  try {
    const result = vnpay.verifyIpnUrl(req.query);

    if (!result.isValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    const order = await Order.findById(result.txnRef);
    if (!order) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    const isSuccess = result.vnpResponseCode === '00';

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          transactionId: result.transactionId,
          gatewayResponse: req.query,
        },
      }
    );

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.paidAt = new Date();
      await order.save();
    }

    // VNPay expects this exact response to confirm IPN received
    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (err) {
    // Always return 200 to VNPay to prevent retries
    console.error('VNPay IPN error:', err);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// ─── MoMo: Create Payment ─────────────────────────────────────────────────────
const createMomoPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (order.paymentMethod !== 'MOMO') {
      return res.status(400).json({ success: false, message: 'Order payment method is not MoMo.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    const orderInfo = `Thanh toan don hang ${order.orderNumber}`;
    const momoResult = await momo.createPayment(
      order._id.toString(),
      order.total,
      orderInfo
    );

    return res.status(200).json({
      success: true,
      data: {
        payUrl: momoResult.payUrl,
        deeplink: momoResult.deeplink,
        qrCodeUrl: momoResult.qrCodeUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── MoMo: Return URL ─────────────────────────────────────────────────────────
const momoReturn = async (req, res, next) => {
  try {
    const result = momo.verifyCallback(req.query);

    if (!result.isValid) {
      return res.status(400).json({ success: false, message: 'Invalid MoMo signature.' });
    }

    const order = await Order.findById(result.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const isSuccess = result.resultCode === 0;

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          transactionId: result.transactionId,
          gatewayResponse: req.query,
        },
      }
    );

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.paidAt = new Date();
      await order.save();
    }

    return res.status(200).json({
      success: isSuccess,
      message: isSuccess ? 'Payment successful.' : `Payment failed: ${result.message}`,
      data: {
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: result.amount,
        resultCode: result.resultCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── MoMo: IPN Webhook ────────────────────────────────────────────────────────
const momoIpn = async (req, res, next) => {
  try {
    const result = momo.verifyCallback(req.body);

    if (!result.isValid) {
      return res.status(200).json({ resultCode: 97, message: 'Invalid signature' });
    }

    const order = await Order.findById(result.orderId);
    if (!order) {
      return res.status(200).json({ resultCode: 1, message: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ resultCode: 2, message: 'Order already paid' });
    }

    const isSuccess = result.resultCode === 0;

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          transactionId: result.transactionId,
          gatewayResponse: req.body,
        },
      }
    );

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.paidAt = new Date();
      await order.save();
    }

    return res.status(200).json({ resultCode: 0, message: 'Success' });
  } catch (err) {
    console.error('MoMo IPN error:', err);
    return res.status(200).json({ resultCode: 99, message: 'Unknown error' });
  }
};

// ─── Get Payment By Order ─────────────────────────────────────────────────────
const getPaymentByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role !== 'ADMIN' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const payment = await Payment.findOne({ order: orderId }).lean();
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    return res.status(200).json({ success: true, data: { payment } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVnpayPayment,
  vnpayReturn,
  vnpayIpn,
  createMomoPayment,
  momoReturn,
  momoIpn,
  getPaymentByOrder,
};
