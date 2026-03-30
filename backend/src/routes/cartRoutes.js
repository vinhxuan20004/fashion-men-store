'use strict';

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart
router.get('/', cartController.getCart);

// POST /api/cart/items
router.post('/items', cartController.addItem);

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', cartController.updateItem);

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', cartController.removeItem);

// DELETE /api/cart
router.delete('/', cartController.clearCart);

// POST /api/cart/apply-voucher
router.post('/apply-voucher', cartController.applyVoucher);

module.exports = router;
