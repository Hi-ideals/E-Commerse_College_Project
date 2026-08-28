const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

/**
 * Runs after an array of express-validator checks; collects errors and
 * throws a single ApiError.validation() if any field failed.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, issue: e.msg }));
    return next(ApiError.validation("Validation failed", details));
  }
  next();
}

module.exports = validate;
