const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");
const env = require("../config/env");

/**
 * 404 handler — must be registered after all routes.
 */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error handler — must be registered last.
 * Converts known/unknown errors into a consistent JSON envelope and
 * never leaks stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, code, message, details } = normalizeError(err);

  if (statusCode >= 500) {
    logger.error(message, { stack: err.stack, path: req.originalUrl, requestId: req.id });
  } else {
    logger.warn(message, { code, path: req.originalUrl, requestId: req.id });
  }

  const body = {
    success: false,
    error: { code, message, ...(details ? { details } : {}), requestId: req.id },
  };

  if (env.nodeEnv !== "production" && statusCode >= 500) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

function normalizeError(err) {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, code: err.code, message: err.message, details: err.details };
  }

  // PostgreSQL unique_violation
  if (err.code === "23505") {
    return { statusCode: 409, code: "CONFLICT", message: "A record with this value already exists" };
  }
  // PostgreSQL foreign_key_violation
  if (err.code === "23503") {
    return { statusCode: 409, code: "CONFLICT", message: "Related resource does not exist" };
  }
  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return { statusCode: 401, code: "UNAUTHORIZED", message: "Invalid or expired token" };
  }
  // Multer file-size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return { statusCode: 400, code: "BAD_REQUEST", message: "Uploaded file is too large" };
  }

  return { statusCode: 500, code: "INTERNAL_ERROR", message: err.message || "Internal server error" };
}

module.exports = { notFoundHandler, errorHandler };
