'use strict';

const express = require('express');
const router = express.Router();

const voucherController = require('../controllers/voucherController');
const { authenticate, authorize } = require('../middleware/auth');
const { voucherValidation } = require('../middleware/validate');

// GET /api/vouchers/active  (public: active vouchers without usage details)
router.get('/active', voucherController.getActive);

// POST /api/vouchers/validate  (authenticated user)
router.post('/validate', authenticate, voucherController.validateVoucher);

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET /api/vouchers  (admin)
router.get('/', authenticate, authorize('ADMIN'), voucherController.getAll);

// POST /api/vouchers  (admin)
router.post('/', authenticate, authorize('ADMIN'), voucherValidation, voucherController.create);

// PUT /api/vouchers/:id  (admin)
router.put('/:id', authenticate, authorize('ADMIN'), voucherValidation, voucherController.update);

// DELETE /api/vouchers/:id  (admin)
router.delete('/:id', authenticate, authorize('ADMIN'), voucherController.delete);

module.exports = router;
