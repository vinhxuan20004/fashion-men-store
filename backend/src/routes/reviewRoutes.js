'use strict';

const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validate');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');

// GET /api/reviews/my  (user's own reviews)
router.get('/my', authenticate, reviewController.getUserReviews);

// GET /api/reviews/admin/all  (admin: all reviews)
router.get('/admin/all', authenticate, authorize('ADMIN'), reviewController.getAllReviews);

// GET /api/reviews/product/:productId
router.get('/product/:productId', reviewController.getProductReviews);

// POST /api/reviews/product/:productId  (authenticated user)
router.post(
  '/product/:productId',
  authenticate,
  uploadProductImages.array('images', 3),
  handleUploadError,
  reviewValidation,
  reviewController.createReview
);

// PATCH /api/reviews/:id/approve  (admin only)
router.patch('/:id/approve', authenticate, authorize('ADMIN'), reviewController.approveReview);

// DELETE /api/reviews/:id  (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), reviewController.deleteReview);

module.exports = router;
