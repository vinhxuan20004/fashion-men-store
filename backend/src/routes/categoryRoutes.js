'use strict';

const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { categoryValidation } = require('../middleware/validate');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');

// GET /api/categories
router.get('/', optionalAuth, categoryController.getAll);

// GET /api/categories/:id  (id or slug)
router.get('/:id', optionalAuth, categoryController.getOne);

// POST /api/categories  (admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadProductImages.single('image'),
  handleUploadError,
  categoryValidation,
  categoryController.create
);

// PUT /api/categories/:id  (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uploadProductImages.single('image'),
  handleUploadError,
  categoryValidation,
  categoryController.update
);

// DELETE /api/categories/:id  (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.delete);

module.exports = router;
