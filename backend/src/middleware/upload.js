'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_BASE = path.join(__dirname, '../../uploads');
const PRODUCTS_DIR = path.join(UPLOADS_BASE, 'products');
const AVATARS_DIR = path.join(UPLOADS_BASE, 'avatars');

// Ensure upload directories exist
[UPLOADS_BASE, PRODUCTS_DIR, AVATARS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Build a multer diskStorage configuration for the given destination.
 * @param {string} dest - Absolute path to upload directory
 */
const buildStorage = (dest) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
  });

/**
 * File filter: allow only image MIME types.
 */
const imageFileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.'), {
        statusCode: 400,
      }),
      false
    );
  }
};

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

/**
 * Multer instance for product images (up to 5 files, field name: images).
 */
const uploadProductImages = multer({
  storage: buildStorage(PRODUCTS_DIR),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 5,
  },
});

/**
 * Multer instance for user avatar (single file, field name: avatar).
 */
const uploadAvatar = multer({
  storage: buildStorage(AVATARS_DIR),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 1,
  },
});

/**
 * Express error-handling wrapper for multer errors.
 * Attach after the multer middleware in a route.
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'File size exceeds the 5 MB limit.',
      LIMIT_FILE_COUNT: 'Too many files. Maximum 5 files allowed.',
      LIMIT_UNEXPECTED_FILE: `Unexpected field: ${err.field}.`,
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || err.message,
    });
  }
  next(err);
};

/**
 * Helper: extract public URL paths from uploaded files.
 * @param {Express.Multer.File[]} files
 * @returns {string[]}
 */
const getFileUrls = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((f) => {
    // Normalise to forward slashes and make relative to /uploads
    const relative = f.path.replace(/\\/g, '/').split('uploads/')[1];
    return `/uploads/${relative}`;
  });
};

/**
 * Helper: extract single file URL.
 * @param {Express.Multer.File} file
 * @returns {string}
 */
const getSingleFileUrl = (file) => {
  if (!file) return '';
  const relative = file.path.replace(/\\/g, '/').split('uploads/')[1];
  return `/uploads/${relative}`;
};

module.exports = {
  uploadProductImages,
  uploadAvatar,
  handleUploadError,
  getFileUrls,
  getSingleFileUrl,
};
