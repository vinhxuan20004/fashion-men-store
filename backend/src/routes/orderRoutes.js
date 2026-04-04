'use strict';

const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validate');

// All order routes require authentication
router.use(authenticate);

// POST /api/orders
router.post('/', orderValidation, orderController.createOrder);

// GET /api/orders  (user's own orders)
router.get('/', orderController.getUserOrders);

// GET /api/orders/admin/all  (admin: all orders with filters)
router.get('/admin/all', authorize('ADMIN'), orderController.getAllOrders);

// GET /api/orders/admin/stats  (admin: order stats)
router.get('/admin/stats', authorize('ADMIN'), orderController.getOrderStats);

// GET /api/orders/:id
router.get('/:id', orderController.getOrderById);

// POST /api/orders/:id/cancel
router.post('/:id/cancel', orderController.cancelOrder);

// PATCH /api/orders/:id/status  (admin only)
router.patch('/:id/status', authorize('ADMIN'), orderController.updateOrderStatus);

module.exports = router;
