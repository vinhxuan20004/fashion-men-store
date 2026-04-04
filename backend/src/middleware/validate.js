'use strict';

const { body, validationResult } = require('express-validator');

/**
 * Run validation and return 422 if any errors found.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth ────────────────────────────────────────────────────────────────────

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('phone')
    .optional()
    .matches(/^[0-9]{9,11}$/).withMessage('Phone must be 9-11 digits'),

  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// ─── Product ─────────────────────────────────────────────────────────────────

const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('salePrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number')
    .custom((value, { req }) => {
      if (value !== null && value !== undefined && value >= req.body.price) {
        throw new Error('Sale price must be less than the original price');
      }
      return true;
    }),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),

  body('description')
    .optional()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),

  body('variants')
    .optional()
    .isArray().withMessage('Variants must be an array'),

  body('variants.*.size')
    .notEmpty().withMessage('Size is required'),
    // Removed strict isIn to allow numeric sizes (32, 33, 34, etc.)

  body('variants.*.color')
    .optional()
    .trim()
    .notEmpty().withMessage('Variant color is required'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  handleValidationErrors,
];

// ─── Category ────────────────────────────────────────────────────────────────

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),

  handleValidationErrors,
];

// ─── Order ───────────────────────────────────────────────────────────────────

const orderValidation = [
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Recipient name is required'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Recipient phone is required')
    .matches(/^[0-9]{9,11}$/).withMessage('Phone must be 9-11 digits'),

  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Street address is required'),

  body('shippingAddress.district')
    .trim()
    .notEmpty().withMessage('District is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER']).withMessage('Invalid payment method'),

  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  handleValidationErrors,
];

// ─── Review ──────────────────────────────────────────────────────────────────

const reviewValidation = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),

  body('orderId')
    .notEmpty().withMessage('Order ID is required')
    .isMongoId().withMessage('Invalid order ID'),

  handleValidationErrors,
];

// ─── Voucher ─────────────────────────────────────────────────────────────────

const voucherValidation = [
  body('code')
    .trim()
    .notEmpty().withMessage('Voucher code is required')
    .isLength({ max: 20 }).withMessage('Voucher code cannot exceed 20 characters')
    .toUpperCase(),

  body('type')
    .notEmpty().withMessage('Voucher type is required')
    .isIn(['PERCENTAGE', 'FIXED']).withMessage('Type must be PERCENTAGE or FIXED'),

  body('value')
    .notEmpty().withMessage('Voucher value is required')
    .isFloat({ min: 0 }).withMessage('Value must be a positive number')
    .custom((value, { req }) => {
      if (req.body.type === 'PERCENTAGE' && value > 100) {
        throw new Error('Percentage value cannot exceed 100');
      }
      return true;
    }),

  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum order value must be non-negative'),

  body('maxDiscount')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Max discount must be non-negative'),

  body('usageLimit')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  categoryValidation,
  orderValidation,
  reviewValidation,
  voucherValidation,
  handleValidationErrors,
};
