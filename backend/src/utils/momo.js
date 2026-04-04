'use strict';

const crypto = require('crypto');
const axios = require('axios');

const PARTNER_CODE = () => process.env.MOMO_PARTNER_CODE || '';
const ACCESS_KEY = () => process.env.MOMO_ACCESS_KEY || '';
const SECRET_KEY = () => process.env.MOMO_SECRET_KEY || '';
const ENDPOINT = () => process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const REDIRECT_URL = () => process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/momo-return';
const IPN_URL = () => process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momo-ipn';

/**
 * Create HMAC SHA256 signature.
 * @param {string} rawSignature
 * @param {string} secretKey
 * @returns {string} Hex-encoded signature
 */
const hmacSha256 = (rawSignature, secretKey) => {
  return crypto.createHmac('sha256', secretKey).update(Buffer.from(rawSignature, 'utf-8')).digest('hex');
};

/**
 * Create a MoMo payment request.
 * @param {string} orderId    - Internal order ID
 * @param {number} amount     - Amount in VND
 * @param {string} orderInfo  - Payment description
 * @returns {Promise<{ payUrl: string, deeplink: string, qrCodeUrl: string, requestId: string }>}
 */
const createPayment = async (orderId, amount, orderInfo) => {
  const requestId = `${PARTNER_CODE()}-${Date.now()}`;
  const extraData = '';
  const requestType = 'payWithMethod';

  // rawSignature MUST follow this exact order (alphabetical by field name)
  const rawSignature = [
    `accessKey=${ACCESS_KEY()}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${IPN_URL()}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${PARTNER_CODE()}`,
    `redirectUrl=${REDIRECT_URL()}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join('&');

  const signature = hmacSha256(rawSignature, SECRET_KEY());

  const requestBody = {
    partnerCode: PARTNER_CODE(),
    accessKey: ACCESS_KEY(),
    requestId,
    amount: String(amount),
    orderId: String(orderId),
    orderInfo,
    redirectUrl: REDIRECT_URL(),
    ipnUrl: IPN_URL(),
    extraData,
    requestType,
    signature,
    lang: 'vi',
  };

  const response = await axios.post(ENDPOINT(), requestBody, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  const data = response.data;

  if (data.resultCode !== 0) {
    throw new Error(`MoMo error [${data.resultCode}]: ${data.message}`);
  }

  return {
    payUrl: data.payUrl,
    deeplink: data.deeplink || '',
    qrCodeUrl: data.qrCodeUrl || '',
    requestId,
  };
};

/**
 * Verify a MoMo IPN/return callback signature.
 * @param {object} body - Parsed request body from MoMo callback
 * @returns {{ isValid: boolean, resultCode: number, transactionId: string, orderId: string }}
 */
const verifyCallback = (body) => {
  const {
    accessKey,
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    transId,
    signature: receivedSignature,
  } = body;

  // Build rawSignature for verification
  const rawSignature = [
    `accessKey=${accessKey || ACCESS_KEY()}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode || PARTNER_CODE()}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`,
  ].join('&');

  const expectedSignature = hmacSha256(rawSignature, SECRET_KEY());
  const isValid = expectedSignature === receivedSignature;

  return {
    isValid,
    resultCode: Number(resultCode),
    transactionId: String(transId || ''),
    orderId: String(orderId || ''),
    amount: Number(amount || 0),
    message: String(message || ''),
  };
};

module.exports = {
  createPayment,
  verifyCallback,
};
