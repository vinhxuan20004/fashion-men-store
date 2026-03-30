'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const { authenticate, authorize } = require('../middleware/auth');
const { uploadProductImages, uploadAvatar, handleUploadError, getFileUrls, getSingleFileUrl } = require('../middleware/upload');

// POST /api/upload/products  — upload up to 5 product images (admin)
router.post(
  '/products',
  authenticate,
  authorize('ADMIN'),
  uploadProductImages.array('images', 5),
  handleUploadError,
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const urls = getFileUrls(req.files);
    return res.status(200).json({
      success: true,
      message: `${urls.length} image(s) uploaded.`,
      data: { urls },
    });
  }
);

// POST /api/upload/avatar  — upload user avatar (authenticated)
router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  handleUploadError,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const url = getSingleFileUrl(req.file);
    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded.',
      data: { url },
    });
  }
);

// DELETE /api/upload  — delete a file by its URL path (admin)
router.delete(
  '/',
  authenticate,
  authorize('ADMIN'),
  (req, res) => {
    const { filePath } = req.body;

    if (!filePath || !filePath.startsWith('/uploads/')) {
      return res.status(400).json({ success: false, message: 'Invalid file path.' });
    }

    // Prevent path traversal
    const relativePath = filePath.replace('/uploads/', '');
    if (relativePath.includes('..')) {
      return res.status(400).json({ success: false, message: 'Invalid file path.' });
    }

    const absolutePath = path.join(__dirname, '../../uploads', relativePath);

    fs.unlink(absolutePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ success: false, message: 'File not found.' });
        }
        return res.status(500).json({ success: false, message: 'Failed to delete file.' });
      }
      return res.status(200).json({ success: true, message: 'File deleted.' });
    });
  }
);

module.exports = router;
