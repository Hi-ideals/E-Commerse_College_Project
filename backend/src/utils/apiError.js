/**
 * Standard application error carrying an HTTP status code and a
 * machine-readable code, so the centralized error handler can format
 * a consistent JSON response.
 */
class ApiError extends Error {
  constructor(statusCode, message, code = "ERROR", details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, "FORBIDDEN");
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message, "NOT_FOUND");
  }
  static conflict(message, details) {
    return new ApiError(409, message, "CONFLICT", details);
  }
  static validation(message, details) {
    return new ApiError(422, message, "VALIDATION_ERROR", details);
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message, "INTERNAL_ERROR");
  }
}

module.exports = ApiError;
