'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validate');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');

// POST /api/auth/register
router.post('/register', registerValidation, authController.register);

// POST /api/auth/login
router.post('/login', loginValidation, authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// GET /api/auth/profile
router.get('/profile', authenticate, authController.getProfile);

// PUT /api/auth/profile
router.put(
  '/profile',
  authenticate,
  uploadAvatar.single('avatar'),
  handleUploadError,
  authController.updateProfile
);

// PUT /api/auth/change-password
router.put('/change-password', authenticate, authController.changePassword);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/auth/admin/users
router.get('/admin/users', authenticate, authorize('ADMIN'), authController.getAllUsers);

// PUT /api/auth/admin/users/:id/status
router.put('/admin/users/:id/status', authenticate, authorize('ADMIN'), authController.updateUserStatus);

// PUT /api/auth/admin/users/:id
router.put('/admin/users/:id', authenticate, authorize('ADMIN'), authController.updateUserAdmin);

// PUT /api/auth/admin/users/:id/role
router.put('/admin/users/:id/role', authenticate, authorize('ADMIN'), authController.updateUserRole);

// PUT /api/auth/admin/users/:id/password
router.put('/admin/users/:id/password', authenticate, authorize('ADMIN'), authController.updateUserPasswordAdmin);

module.exports = router;
