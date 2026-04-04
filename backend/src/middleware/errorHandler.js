'use strict';

/**
 * Global error handler middleware.
 * Must have 4 parameters for Express to treat it as an error handler.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // ── Mongoose Validation Error ──────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose Duplicate Key Error ──────────────────────────────────────────
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value for field '${field}': '${value}' already exists.`;
    errors = [{ field, message }];
  }

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────────
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: '${err.value}'.`;
    errors = [{ field: err.path, message }];
  }

  // ── JWT Errors ─────────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  } else if (err.name === 'NotBeforeError') {
    statusCode = 401;
    message = 'Token not yet active.';
  }

  // ── CORS Error ─────────────────────────────────────────────────────────────
  else if (err.message && err.message.startsWith('CORS policy')) {
    statusCode = 403;
    message = err.message;
  }

  // ── Multer Errors ──────────────────────────────────────────────────────────
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the 5 MB limit.';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files. Maximum 5 files allowed.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = `Unexpected field: ${err.field}.`;
  }

  // ── Log server errors ──────────────────────────────────────────────────────
  if (statusCode >= 500) {
    console.error('[ErrorHandler]', {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
