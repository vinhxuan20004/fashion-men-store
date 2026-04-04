'use strict';

/**
 * Generate a unique order number.
 * Format: ORD-YYYYMMDD-XXXXXXXX (8 random hex chars)
 * @returns {string}
 */
const generateOrderNumber = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
};

/**
 * Convert a string into a URL-friendly slug.
 * Handles Vietnamese characters.
 * @param {string} str
 * @returns {string}
 */
const generateSlug = (str) => {
  if (!str) return '';

  const vietnameseMap = {
    à: 'a', á: 'a', ạ: 'a', ả: 'a', ã: 'a',
    â: 'a', ầ: 'a', ấ: 'a', ậ: 'a', ẩ: 'a', ẫ: 'a',
    ă: 'a', ằ: 'a', ắ: 'a', ặ: 'a', ẳ: 'a', ẵ: 'a',
    è: 'e', é: 'e', ẹ: 'e', ẻ: 'e', ẽ: 'e',
    ê: 'e', ề: 'e', ế: 'e', ệ: 'e', ể: 'e', ễ: 'e',
    ì: 'i', í: 'i', ị: 'i', ỉ: 'i', ĩ: 'i',
    ò: 'o', ó: 'o', ọ: 'o', ỏ: 'o', õ: 'o',
    ô: 'o', ồ: 'o', ố: 'o', ộ: 'o', ổ: 'o', ỗ: 'o',
    ơ: 'o', ờ: 'o', ớ: 'o', ợ: 'o', ở: 'o', ỡ: 'o',
    ù: 'u', ú: 'u', ụ: 'u', ủ: 'u', ũ: 'u',
    ư: 'u', ừ: 'u', ứ: 'u', ự: 'u', ử: 'u', ữ: 'u',
    ỳ: 'y', ý: 'y', ỵ: 'y', ỷ: 'y', ỹ: 'y',
    đ: 'd',
  };

  return str
    .toLowerCase()
    .split('')
    .map((char) => vietnameseMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Build pagination metadata.
 * @param {number} page  - Current page (1-based)
 * @param {number} limit - Items per page
 * @returns {{ skip: number, limit: number, page: number }}
 */
const paginate = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;
  return { skip, limit: parsedLimit, page: parsedPage };
};

/**
 * Calculate the discount amount a voucher provides for a subtotal.
 * @param {object} voucher  - Voucher document
 * @param {number} subtotal - Order subtotal in VND
 * @returns {number} Discount amount (always >= 0)
 */
const calculateDiscount = (voucher, subtotal) => {
  if (!voucher) return 0;
  if (subtotal < voucher.minOrderValue) return 0;

  let discount = 0;

  if (voucher.type === 'PERCENTAGE') {
    discount = (subtotal * voucher.value) / 100;
    if (voucher.maxDiscount !== null && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else if (voucher.type === 'FIXED') {
    discount = voucher.value;
  }

  // Discount cannot exceed the subtotal
  return Math.min(discount, subtotal);
};

module.exports = {
  generateOrderNumber,
  generateSlug,
  paginate,
  calculateDiscount,
};
