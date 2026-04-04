'use strict';

const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_me';
const ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate a short-lived access token.
 * @param {string} userId - MongoDB user _id
 * @param {string} role - User role (USER | ADMIN)
 * @returns {string} Signed JWT
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId.toString(), role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRE }
  );
};

/**
 * Generate a long-lived refresh token.
 * @param {string} userId - MongoDB user _id
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId.toString() },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRE }
  );
};

/**
 * Verify an access token.
 * @param {string} token
 * @returns {{ id: string, role: string, iat: number, exp: number }}
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {{ id: string, iat: number, exp: number }}
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
