'use strict';

const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

// ── VNPay ──────────────────────────────────────────────────────────────────────

// POST /api/payments/vnpay/create  (authenticated user)
router.post('/vnpay/create', authenticate, paymentController.createVnpayPayment);

// GET /api/payments/vnpay-return  (VNPay redirects here — no auth, signature verified)
router.get('/vnpay-return', paymentController.vnpayReturn);

// GET /api/payments/vnpay-ipn  (VNPay webhook — no auth, signature verified)
router.get('/vnpay-ipn', paymentController.vnpayIpn);

// ── MoMo ──────────────────────────────────────────────────────────────────────

// POST /api/payments/momo/create  (authenticated user)
router.post('/momo/create', authenticate, paymentController.createMomoPayment);

// GET /api/payments/momo-return  (MoMo redirects here — no auth, signature verified)
router.get('/momo-return', paymentController.momoReturn);

// POST /api/payments/momo-ipn  (MoMo webhook — no auth, signature verified)
router.post('/momo-ipn', paymentController.momoIpn);

// ── Shared ────────────────────────────────────────────────────────────────────

// GET /api/payments/order/:orderId  (owner or admin)
router.get('/order/:orderId', authenticate, paymentController.getPaymentByOrder);

module.exports = router;
