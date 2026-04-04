'use strict';

const crypto = require('crypto');
const qs = require('qs');

const VNPAY_TMN_CODE = () => process.env.VNPAY_TMN_CODE || '';
const VNPAY_HASH_SECRET = () => process.env.VNPAY_HASH_SECRET || '';
const VNPAY_URL = () => process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = () => process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay-return';

/**
 * Format date to VNPay's required format: YYYYMMDDHHmmss
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

/**
 * Create HMAC SHA512 signature.
 * @param {string} data
 * @param {string} secret
 * @returns {string} Hex-encoded signature
 */
const hmacSha512 = (data, secret) => {
  return crypto.createHmac('sha512', secret).update(Buffer.from(data, 'utf-8')).digest('hex');
};

/**
 * Sort object keys alphabetically and build query string (without encoding).
 * VNPay requires keys sorted alphabetically.
 * @param {object} params
 * @returns {string}
 */
const buildSortedQueryString = (params) => {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
};

/**
 * Create VNPay payment URL.
 * @param {string} orderId    - Internal order ID (used as vnp_TxnRef)
 * @param {number} amount     - Amount in VND (will be multiplied by 100)
 * @param {string} orderInfo  - Payment description
 * @param {string} ipAddr     - Client IP address
 * @param {string} [locale]   - 'vn' or 'en', default 'vn'
 * @returns {string} Full payment URL
 */
const createPaymentUrl = (orderId, amount, orderInfo, ipAddr, locale = 'vn') => {
  const now = new Date();
  const createDate = formatDate(now);
  const expireDate = formatDate(new Date(now.getTime() + 15 * 60 * 1000)); // 15 min

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE(),
    vnp_Amount: String(Math.round(amount) * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: encodeURIComponent(orderInfo),
    vnp_OrderType: 'other',
    vnp_Locale: locale,
    vnp_ReturnUrl: VNPAY_RETURN_URL(),
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const sortedQueryString = buildSortedQueryString(params);
  const secureHash = hmacSha512(sortedQueryString, VNPAY_HASH_SECRET());

  return `${VNPAY_URL()}?${sortedQueryString}&vnp_SecureHash=${secureHash}`;
};

/**
 * Verify a VNPay return/IPN URL by checking the secure hash.
 * @param {object} query - req.query object from the return URL
 * @returns {{ isValid: boolean, vnpResponseCode: string, transactionId: string }}
 */
const verifyReturnUrl = (query) => {
  const { vnp_SecureHash, vnp_SecureHashType, ...params } = query;

  // Remove hash fields before verifying
  const sortedQueryString = buildSortedQueryString(params);
  const expectedHash = hmacSha512(sortedQueryString, VNPAY_HASH_SECRET());

  const isValid = expectedHash === vnp_SecureHash;

  return {
    isValid,
    vnpResponseCode: params.vnp_ResponseCode || '',
    transactionId: params.vnp_TransactionNo || '',
    txnRef: params.vnp_TxnRef || '',
    amount: params.vnp_Amount ? Number(params.vnp_Amount) / 100 : 0,
    orderInfo: params.vnp_OrderInfo || '',
    bankCode: params.vnp_BankCode || '',
    payDate: params.vnp_PayDate || '',
  };
};

/**
 * Verify a VNPay IPN (Instant Payment Notification) callback.
 * Same logic as verifyReturnUrl – VNPay uses the same signature algorithm.
 * @param {object} query - req.query object
 * @returns {{ isValid: boolean, vnpResponseCode: string, transactionId: string }}
 */
const verifyIpnUrl = (query) => {
  return verifyReturnUrl(query);
};

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
  verifyIpnUrl,
};
