'use strict';

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { productValidation } = require('../middleware/validate');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');

// GET /api/products/featured
router.get('/featured', productController.getFeatured);

// GET /api/products
router.get('/', optionalAuth, productController.getAll);

// GET /api/products/:id  (id or slug)
router.get('/:id', optionalAuth, productController.getOne);

// GET /api/products/:id/related
router.get('/:id/related', productController.getRelated);

// POST /api/products  (admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadProductImages.array('images', 5),
  handleUploadError,
  productValidation,
  productController.create
);

// PUT /api/products/:id  (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uploadProductImages.array('images', 5),
  handleUploadError,
  productValidation,
  productController.update
);

// DELETE /api/products/:id  (admin only, soft delete)
router.delete('/:id', authenticate, authorize('ADMIN'), productController.delete);

// POST /api/products/:id/images (admin only, append images to a product)
router.post(
  '/:id/images',
  authenticate,
  authorize('ADMIN'),
  uploadProductImages.array('images', 5),
  handleUploadError,
  productController.addProductImages
);

// DELETE /api/products/:id/images (admin only, remove a specific image)
router.post(
  '/:id/images/delete',
  authenticate,
  authorize('ADMIN'),
  productController.removeProductImage
);

// POST /api/products/upload-images  (admin only, standalone image upload)
router.post(
  '/upload-images',
  authenticate,
  authorize('ADMIN'),
  uploadProductImages.array('images', 5),
  handleUploadError,
  productController.uploadImages
);

module.exports = router;
