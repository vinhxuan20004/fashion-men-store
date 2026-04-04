'use strict';

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboardStats);

// GET /api/admin/revenue  ?period=day|month|year&year=2024&month=3
router.get('/revenue', adminController.getRevenueByPeriod);

// GET /api/admin/top-products
router.get('/top-products', adminController.getTopProducts);

// GET /api/admin/order-status-distribution
router.get('/order-status-distribution', adminController.getOrderStatusDistribution);

// GET /api/admin/recent-orders
router.get('/recent-orders', adminController.getRecentOrders);

// GET /api/admin/recent-users
router.get('/recent-users', adminController.getRecentUsers);

// GET /api/admin/low-stock  ?threshold=10
router.get('/low-stock', adminController.getLowStockProducts);

// GET /api/admin/users
router.get('/users', adminController.getAllUsers);


// GET /api/admin/pending-reviews
router.get('/pending-reviews', adminController.getPendingReviews);

// GET /api/admin/settings
router.get('/settings', adminController.getSettings);

// PATCH /api/admin/settings
router.patch('/settings', adminController.updateSettings);

module.exports = router;
